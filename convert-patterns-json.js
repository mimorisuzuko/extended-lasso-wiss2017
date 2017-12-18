const _ = require('lodash');
const fs = require('fs');

const txt = fs.readFileSync('./patterns.txt', { encoding: 'utf-8' });
const MAX_WIDTH = 6;
const MAX_HEIGHT = 6;

/**
 * @param {{}} pattern
 * @param {number} rate
 * @returns {{}}
 */
const rotate = (pattern, rate) => {
	const angle = Math.PI / 2 * rate;
	let { blocks, width, height } = pattern;
	const tmp = [];
	let minX = Infinity;
	let minY = Infinity;

	if (rate % 2 === 1) {
		const t = width;
		width = height;
		height = t;
	}

	_.forEach(blocks, (a, j) => {
		_.forEach(a, (b, i) => {
			const x = _.round(i * Math.cos(angle) - j * Math.sin(angle));
			const y = _.round(i * Math.sin(angle) + j * Math.cos(angle));
			minX = Math.min(x, minX);
			minY = Math.min(y, minY);
			tmp.push([b, x, y]);
		});
	});

	blocks = _.map(Array(height), () => Array(width));

	_.forEach(tmp, ([v, x, y]) => {
		console.log(y - minY, x - minX, v);
		blocks[y - minY][x - minX] = v;
	});

	return {
		width,
		height,
		dx: _.random(0, Math.max(0, MAX_WIDTH - width - 1)),
		dy: _.random(0, Math.max(0, MAX_HEIGHT - height - 1)),
		blocks
	};
};

const patterns = _.map(_.split(txt, '\n\n'), (a) => {
	const [width, height, ...blocks] = _.split(a, '\n');

	return rotate({
		width: _.parseInt(width),
		height: _.parseInt(height),
		blocks: _.map(blocks, (b) => _.map(b, (c) => Boolean(_.parseInt(c))))
	}, _.random(0, 3));
});

fs.writeFileSync(
	'./src/patterns.json',
	JSON.stringify({
		MAX_WIDTH,
		MAX_HEIGHT,
		patterns
	}),
	{ encoding: 'utf-8' }
);
