"use strict";

const postcss = require("postcss");
const { join } = require("path");
const { tmpdir } = require("os");
const { readFileSync, writeFileSync, readdirSync, unlinkSync } = require("fs");
const utils = require("./utils");
const plugin = require("./");

const tryUnlink = file => {
    try {
        unlinkSync(file);
    } catch (e) {
        // Ignore
    }
};

const CSS_FILES = {
    "file01.css": ".a {}",
    "file02.css": ".b {background-color: #fff}",
    "file03.scss": ".c {}"
};
const MANIFEST_FILES = ["manifest.json"];

beforeEach(() => {
    MANIFEST_FILES.forEach(file => tryUnlink(join(tmpdir(), file)));
    Object.keys(CSS_FILES).forEach(file =>
        writeFileSync(join(tmpdir(), file), CSS_FILES[file])
    );
});

afterEach(() => {
    Object.keys(CSS_FILES)
        .concat(MANIFEST_FILES)
        .forEach(file => tryUnlink(join(tmpdir(), file)));
});

test("hash module", () => {
    const file = join(tmpdir(), "file01.css");

    expect.assertions(1);
    expect(utils.hash(readFileSync(file, "utf-8"), "sha256", 5)).toHaveLength(
        5
    );
});

test("defaultName module", () => {
    const parts = {
        dir: "in",
        name: "file01",
        hash: "deadbeef",
        ext: ".css"
    };
    expect.assertions(1);
    expect(utils.defaultName(parts)).toBe("in/file01.deadbeef.css");
});

test("rename module", () => {
    const file = join(tmpdir(), "file01.css");
    const opts = { algorithm: "sha256", trim: 5, name: utils.defaultName };
    const hash = utils.hash(
        readFileSync(file, "utf-8"),
        opts.algorithm,
        opts.trim
    );

    expect.assertions(1);
    expect(utils.rename(file, readFileSync(file, "utf-8"), opts)).toMatch(
        new RegExp(hash)
    );
});

test("data module", () => {
    const file = join(tmpdir(), "file01.css");
    const opts = { algorithm: "md5", trim: 5, name: utils.defaultName };
    const renamedFile = utils.rename(file, readFileSync(file, "utf-8"), opts);

    expect.assertions(1);
    expect(utils.data(file, renamedFile)).toBeInstanceOf(Object);
});

test("plugin", () => {
    const opts = {
        algorithm: "md5",
        trim: 5,
        manifest: join(tmpdir(), "manifest.json")
    };

    const files = readdirSync(tmpdir()).filter(name => /css$/.test(name));

    return Promise.all(
        files.map(file => {
            const filePath = join(tmpdir(), file);
            return postcss([plugin(opts)])
                .process(readFileSync(filePath, "utf-8"), {
                    from: file,
                    to: file
                })
                .then(result => {
                    const hash = utils.hash(
                        readFileSync(filePath, "utf-8"),
                        opts.algorithm,
                        opts.trim
                    );

                    expect(result.opts.to).toMatch(new RegExp(hash));
                    expect(result.warnings().length).toBe(0);
                    const manifest = JSON.parse(
                        readFileSync(join(tmpdir(), "manifest.json"))
                    );
                    expect(typeof manifest).toBe("object");
                    expect(manifest).toHaveProperty([file], result.opts.to);
                });
        })
    );
});

test("plugin ensures manifest directory is created", () => {
    const opts = {
        algorithm: "md5",
        trim: 5,
        manifest: join(tmpdir(), "foo/bar/baz/manifest.json")
    };
    const filePath = join(tmpdir(), "file01.css");
    return postcss([plugin(opts)])
        .process(readFileSync(filePath, "utf-8"), {
            from: filePath,
            to: filePath
        })
        .then(result => {
            const hash = utils.hash(
                readFileSync(filePath, "utf-8"),
                opts.algorithm,
                opts.trim
            );

            expect(result.opts.to).toMatch(new RegExp(hash));
            expect(result.warnings().length).toBe(0);
        });
});

test("plugin will hash sourcemap with includeMap", () => {
    const opts = {
        algorithm: "sha512",
        trim: 5,
        includeMap: true,
        manifest: join(tmpdir(), "foo/bar/baz/manifest.json")
    };
    const filePath = join(tmpdir(), "file01.css");
    return postcss([plugin(opts)])
        .process(readFileSync(filePath, "utf-8"), {
            from: filePath,
            to: filePath,
            map: { inline: false },
        })
        .then(result => {
            const hash = utils.hash(
                '.a {}\n/*# sourceMappingURL=file01.88aab.css.map */',
                opts.algorithm,
                opts.trim
            );

            expect(result.opts.to).toMatch(new RegExp(hash));
            expect(result.warnings().length).toBe(0);
        });
});
