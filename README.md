# PostCSS Hash [![Build Status][ci-img]][ci]

[PostCSS] plugin to replace output file names with **HASH** algorithms (`md5`, `sha256`, `sha512`, etc) and string length of your choice - for cache busting.

```sh
# input
postcss input.css -o output.css

# output
output.a1b2c3d4e5.css

# ./manifest.json
{
  "output.css": "output.a1b2c3d4e5.css",
}

```

```sh
# input
postcss css/in/*.css --dir css/out/

# output
file1.a516675ef8.css
file2.aa36634cc4.css
file3.653f682ad9.css
file4.248a1e8f9e.css
file5.07534806bd.css

# ./manifest.json
{
  "file1.css": "file1.a516675ef8.css",
  "file2.css": "file2.aa36634cc4.css",
  "file3.css": "file3.653f682ad9.css",
  "file4.css": "file4.248a1e8f9e.css",
  "file5.css": "file5.07534806bd.css"
}
```

## Usage

```js
// postcss.config.js
module.exports = (ctx) => ({
    plugins: {
        'postcss-hash': {
            algorithm: 'sha256',
            trim: 20,
            manifest: './manifest.json'
        },
    }
});
```

## Options
### algorithm `(string, default: 'md5')`
Uses node's inbuilt [crypto] module. Pass any `digest algorithm` that is supported in your environment. Possible values are: `md5`, `md4`, `md2`, `sha`, `sha1`, `sha224`, `sha256`, `sha384`, `sha512`.

### includeMap `(boolean, default: false)`
Setting `includeMap` to `true` will allow postcss-hash to hash the name of the sourcemap, as well hash the CSS _including_ the `sourceMappingURL` comment. You can set this option to true if you care about the hashed fingerprints matching the contents of the CSS file, and don't mind a performance hit of regenerating the CSS twice.


### trim `(number, default: 10)`
Hash's length.

### manifest `(string, default: './manifest.json')`
Will output a `manifest` file with `key: value` pairs.

### name `(function, default: ({dir, name, hash, ext}) => path.join(dir, name + '.' + hash + ext)`
Pass a function to customise the name of the output file. The function is given an object of string values:

 - dir: the directory name as a string
 - name: the name of the file, excluding any extensions
 - hash: the resulting hash digest of the file
 - ext: the extension of the file

**NOTE:**
1. The values will be either appended or replaced. If this file needs be recreated on each run, you'll have to manually delete it.
2. `key`s are generated with files' `basename`. If you have `./input/A/one.css` & `./input/B/one.css`, only the last entry will exist.

### updateEntry `(function, default: (originalName, hashedName) => { "fileName.css": "hashedName.css"}`

Pass a function to customize manifest entries. The function is given

- `originalName`: the original file name.
- `hashedName`: the compiled file name.

The function must return an object with the fileName as a key and whatever value you want. E.g.:

```js
function e(originalName, hashedName) {
  var newData = {};
  var key = path.parse(originalName).base;
  var value = path.parse(hashedName).base;

  newData[key] = { src: value, css: true };

  return newData;
}
```

See [PostCSS] docs for examples for your environment.

```
Version: 0.2.0
Updated on: August 29, 2017
```

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/dacodekid/postcss-hash.svg
[ci]:      https://travis-ci.org/dacodekid/postcss-hash
[crypto]:  https://nodejs.org/api/crypto.html
