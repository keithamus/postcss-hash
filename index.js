'use strict';

const { readFile, writeFile } = require('fs');
const postcss = require('postcss');
const utils = require('./utils');
const readFileAsync = (file, enc) => new Promise((res, rej) => {
    readFile(file, enc, (err, val) => err ? rej(err) : res(val));
});
const writeFileAsync = (file, data, enc) => new Promise((res, rej) => {
    writeFile(file, data, enc, (err, val) => err ? rej(err) : res(val));
});

module.exports = postcss.plugin('postcss-hash', (opts) => {
    opts = Object.assign({
        algorithm: 'md5',
        trim: 10,
        manifest: './manifest.json',
        name: utils.defaultName
    }, opts);

    return function (root, result) {
        // replace filename
        const originalName = result.opts.to;
        result.opts.to = utils.rename(originalName, root.toString(), opts);

        // create/update manifest.json
        const newData = utils.data(originalName, result.opts.to);
        return readFileAsync(opts.manifest, 'utf-8')
            .then(JSON.parse, () => ({}))
            .then(oldData => Object.assign(oldData, newData))
            .then(obj => JSON.stringify(obj, null, 2))
            .then(data => writeFileAsync(opts.manifest, data, 'utf-8'));
    };
});
