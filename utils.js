const path = require('path');
const crypto = require('crypto');

function replace(css, file, opts) {
    return file
        .substr(0, file.lastIndexOf('.')) + '.' +
        crypto
          .createHash(opts.algorithm)
          .update(css)
          .digest('hex')
          .substr(0, opts.trim) +
        path.extname(file);
}

module.exports.replace = replace;
