'use strict';

const fs = require('fs-extra');
const postcss = require('postcss');
const _ = require('lodash');
const utils = require('./utils');

module.exports = postcss.plugin('postcss-hash', (opts) => {
    opts = _.defaults(opts, {
        algorithm: 'md5',
        trim: 10,
        manifest: './manifest.json',
        name: utils.defaultName
    });

    return function (root, result) {
        var [oldData, newData] = [{}, {}];
        var originalName = '';

        // replace filename
        originalName = result.opts.to;
        result.opts.to = utils.rename(originalName, root.source.input.css, opts);

        // create/update manifest.json
        newData = utils.data(originalName, result.opts.to);
        try {
            oldData = fs.readJsonSync(opts.manifest);
            fs.outputJsonSync(
              opts.manifest,
              _.assign(oldData, newData),
              { spaces: 2 }
            );
        } catch (e) {
            fs.outputJsonSync(opts.manifest, newData, { spaces: 2 });
        }
    };
});
