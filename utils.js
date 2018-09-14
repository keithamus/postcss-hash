const crypto = require("crypto");
const path = require("path");

/*
a function to get hash value for an given content with desired string length.
input: ('a{}', 'sha', 10)   output: a1b2c3d4e5
*/
function hash(css, algorithm, trim) {
    return crypto
        .createHash(algorithm)
        .update(css)
        .digest("hex")
        .substr(0, trim);
}

function defaultName(parts) {
    return path.join(parts.dir, parts.name + "." + parts.hash + parts.ext);
}

/*
a function to rename a filename by appending hash value.
input: ('./file.css', 'a {}', {algorithm: 'sha256', trim: 10})   output: ./file.a1b2c3d4e5.css
*/
function rename(file, css, opts) {
    return opts.name({
        dir: path.dirname(file),
        name: path.basename(file, path.extname(file)),
        ext: path.extname(file),
        hash: hash(css, opts.algorithm, opts.trim)
    });
}

/*
will return an object of {oldname: newname} to append/update into manifest file.
input: ('./css/file.css', './file.a1b2c3d4e5.css')   output: {"file.css": "file.a1b2c3d4e5.css"}
*/
function data(originalName, hashedName) {
    var newData = {};
    var key = path.parse(originalName).base;
    var value = path.parse(hashedName).base;

    newData[key] = value;
    return newData;
}

module.exports.hash = hash;
module.exports.rename = rename;
module.exports.defaultName = defaultName;
module.exports.data = data;
