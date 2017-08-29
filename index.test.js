'use strict';

const mockfs = require('mock-fs');
const fs = require('fs-extra');
const postcss = require('postcss');
const path = require('path');

const utils = require('./utils');
const plugin = require('./');

const CSS_FILES = {
    './in': {
        'file01.css': '.a {}',
        'file02.css': '.b {background-color: #fff}',
        'file03.scss': '.c {}'
    }
};

beforeEach(() => {
    mockfs(CSS_FILES);
});

afterEach(() => {
    mockfs.restore();
});

function content(file) {
    return fs.readFileSync(file).toString();
}

function run(file, opts) {
    return postcss([ plugin(opts)]).process(content('./' + file), {
        from: file,
        to: file
    }).then(result => {
        const hash = utils.hash(content(file), opts.algorithm, opts.trim);

        expect(result.opts.to).toMatch(new RegExp(hash));
        expect(result.warnings().length).toBe(0);
    });
}

test('hash module', () => {
    const file = './in/file01.css';

    expect.assertions(1);
    expect(utils.hash(content(file), 'sha256', 5)).toHaveLength(5);
});

test('rename module', () => {
    const file = './in/file01.css';
    const opts = { algorithm: 'sha', trim: 5 };
    const hash = utils.hash(content(file), opts.algorithm, opts.trim);

    expect.assertions(1);
    expect(utils.rename(file, content(file), opts)).toMatch(new RegExp(hash));
});

test('data module', () => {
    const file = './in/file01.css';
    const opts = { algorithm: 'md5', trim: 5 };
    const renamedFile = utils.rename(file, content(file), opts);

    expect.assertions(1);
    expect(utils.data(file, renamedFile)).toBeInstanceOf(Object);
});

test('plugin', () => {
    const root = './in';
    const opts = { algorithm: 'md5', trim: 5 };

    const files = fs.readdirSync(root);

    for (var file in files) {
        run(path.join(root, files[file]), opts);
    }
});
