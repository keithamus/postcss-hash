const postcss = require('postcss');
const plugin = require('./');
const utils = require('./utils');

test('algorithm options', () => {
    var css = 'a{}';
    var file = 'output.css';
    var opts = { algorithm: 'ripemd160' };

    return postcss([plugin(opts)]).process(css, {
        to: file
    }).then(result => {
        expect(result.opts.to).toEqual(utils.replace(result.css, file, opts));
        expect(result.warnings().length).toBe(0);
    });
});
