'use strict';

const fs = require('fs-extra');
const postcss = require('postcss');
const utils = require('./utils');

module.exports = postcss.plugin('postcss-hash', (opts) => {
    opts = Object.assign({
        algorithm: 'md5',
        trim: 10,
        manifest: './manifest.json',
        name: utils.defaultName
    }, opts);

    return function (root, result) {
        var [oldData, newData] = [{}, {}];
        var originalName = '';

        // replace filename
        originalName = result.opts.to;
        result.opts.to = utils.rename(originalName, root.toString(), opts);

        // create/update manifest.json
        newData = utils.data(originalName, result.opts.to);
        try {
            oldData = fs.readJsonSync(opts.manifest);
            fs.outputJsonSync(
              opts.manifest,
              Object.assign(oldData, newData),
              { spaces: 2 }
            );
        } catch (e) {
            fs.outputJsonSync(opts.manifest, newData, { spaces: 2 });
        }
    };
});
