const postcss = require('postcss');
const _ = require('lodash').defaults;
const utils = require('./utils');

module.exports = postcss.plugin('postcss-md5', (opts) => {
    opts = _(opts, {
        algorithm: 'md5',
        trim: 10
    });

    return function (root, result) {
        result.opts.to = utils.replace(
          root.source.input.css,
          result.opts.to,
          opts
        );
    };
});
