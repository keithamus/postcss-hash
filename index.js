"use strict";

const { readFileSync, writeFileSync } = require("fs");
const { dirname } = require("path");
const postcss = require("postcss");
const utils = require("./utils");
const mkdirp = require("mkdirp");

module.exports = postcss.plugin("postcss-hash", opts => {
    opts = Object.assign(
        {
            algorithm: "md5",
            trim: 10,
            manifest: "./manifest.json",
            name: utils.defaultName
        },
        opts
    );

    return function(root, result) {
        // replace filename
        const originalName = result.opts.to;
        result.opts.to = utils.rename(originalName, root.toString(), opts);

        // create/update manifest.json
        const newData = utils.data(originalName, result.opts.to);

        // You're probably thinking "Why not make all of the following async?!"
        // Well, using the async versions causes race conditions when this plugin
        // is called multiple times. Try switching to async versions and running the tests
        // and you'll see they fail
        mkdirp.sync(dirname(opts.manifest))
        let oldData = {}
        try {
            oldData = JSON.parse(readFileSync(opts.manifest, "utf-8"));
        } catch (e) {
            oldData = {}
        }
        const data = JSON.stringify(Object.assign(oldData, newData), null, 2);
        writeFileSync(opts.manifest, data, "utf-8");
    };
});
