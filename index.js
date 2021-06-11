"use strict";

const { readFileSync, writeFileSync } = require("fs");
const { dirname, basename } = require("path");
const MapGenerator = require("postcss/lib/map-generator");
const utils = require("./utils");
const mkdirp = require("mkdirp");

module.exports = opts => {
    opts = Object.assign(
        {
            algorithm: "md5",
            trim: 10,
            manifest: "./manifest.json",
            includeMap: false,
            name: utils.defaultName
        },
        opts
    );

    return {
        postcssPlugin: "postcss-hash",
        OnceExit(root, { result, stringify }) {
            // replace filename
            const originalName = result.opts.to;
            result.opts.to = utils.rename(originalName, root.toString(), opts);

            // In order to get content addressable hash names, we need to generate
            // and hash the map file first, which gives us the ability to hash that,
            // then we can do a full map.generate() which will apply the sourceMappingURL
            // to the CSS file, allowing us to do a full hash of the CSS including
            // thes sourceMappingURL comment.
            if (opts.includeMap) {
                // Extract the stringifier
                let str = stringify;
                if (result.opts.syntax) str = result.opts.syntax.stringify;
                if (result.opts.stringifier) str = result.opts.stringifier;
                if (str.stringify) str = str.stringify;

                // Generate the sourceMap contents
                const map = new MapGenerator(str, root, result.opts);
                map.generateString();

                const hash = utils.rename(
                    originalName,
                    map.map.toString(),
                    opts
                );

                // If the sourcemap annotation option is set, then we can name the sourcemap
                // based on the contents of its map, so change the option to be a string.
                if (result.opts.map) {
                    result.opts.map.annotation = basename(`${hash}.map`);
                }

                // need to call map.generate() which applies the sourceMappingURL comment
                // to the CSS and returns it as res[0]
                const res = map.generate();

                result.opts.to = utils.rename(originalName, res[0], opts);
            } else {
                result.opts.to = utils.rename(
                    originalName,
                    root.toString(),
                    opts
                );
            }

            // create/update manifest.json
            const newData = utils.data(originalName, result.opts.to);

            // You're probably thinking "Why not make all of the following async?!"
            // Well, using the async versions causes race conditions when this plugin
            // is called multiple times. Try switching to async versions and running the tests
            // and you'll see they fail
            mkdirp.sync(dirname(opts.manifest));
            let oldData = {};
            try {
                oldData = JSON.parse(readFileSync(opts.manifest, "utf-8"));
            } catch (e) {
                oldData = {};
            }
            const data = JSON.stringify(
                Object.assign(oldData, newData),
                null,
                2
            );
            writeFileSync(opts.manifest, data, "utf-8");
        }
    };
};

module.exports.postcss = true;
