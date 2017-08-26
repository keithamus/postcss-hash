# PostCSS Hash [![Build Status][ci-img]][ci]

[PostCSS] plugin to replace output file names with **HASH** algorithms (md5, sha256, sha512, etc) and string length of your choice - for cache busting.

```sh
# input
postcss input.css -o output.css

# output
output.a1b2c3d4e5.css
```

```sh
# input
postcss css/in/*.css --dir css/out/

# output
file1.a516675ef8.css
file2.aa36634cc4.css
file3.653f682ad9.css
file4.248a1e8f9e.css
file5.07534806bf.css
```

## Usage

```js
// postcss.config.js
module.exports = (ctx) => ({
    plugins: {
        'postcss-hash': {
            algorithm: 'sha256',
            trim: 20
        },
    }
});
```

## Options
### algorithm `(string, default: 'md5')`

Uses node's inbuilt [crypto] module. Pass any `digest algorithm` that is supported in your environment. Possible values are: `md5`, `md4`, `md2`, `sha`, `sha1`, `sha224`, `sha256`, `sha384`, `sha512`.


### trim `(number, default: 10)`

Trim the hash length as you needed.



See [PostCSS] docs for examples for your environment.

```
Version: 1.0.0
Updated on: August 26, 2017
```

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/dacodekid/postcss-hash.svg
[ci]:      https://travis-ci.org/dacodekid/postcss-hash
[crypto]:  https://nodejs.org/api/crypto.html
