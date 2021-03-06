const uglify = require('uglify-js');
const assert = require('assert');
const getLocation = require('../../getLocation');
const SourceMapConsumer = require('source-map').SourceMapConsumer;

module.exports = {
	description: 'preserves sourcemap chains when transforming',
	options: {
		plugins: [
			{
				renderChunk(code) {
					const options = {
						sourceMap: {
							filename: 'x' // trigger sourcemap generation
						}
					};

					return uglify.minify(code, options);
				}
			}
		]
	},
	test(code, map) {
		const smc = new SourceMapConsumer(map);

		let generatedLoc = getLocation(code, code.indexOf('42'));
		let originalLoc = smc.originalPositionFor(generatedLoc);

		assert.ok(/main/.test(originalLoc.source));
		assert.equal(originalLoc.line, 1);
		assert.equal(originalLoc.column, 13);

		generatedLoc = getLocation(code, code.indexOf('log'));
		originalLoc = smc.originalPositionFor(generatedLoc);

		assert.equal(originalLoc.line, 1);
		assert.equal(originalLoc.column, 8);
	}
};
