import { Record, List, fromJS } from 'immutable';
import { patterns, MAX_WIDTH, MAX_HEIGHT } from '../patterns.json';

export class Block extends Record({
	cx: 0,
	cy: 0,
	width: 0,
	height: 0,
	selected: false,
	target: false
}) {

	/**
	 * @returns {{ left: number, top: number, right: number, bottom: number }}
	 */
	getRect() {
		const width = this.get('width');
		const height = this.get('height');
		const dx = width / 2;
		const dy = height / 2;
		const cx = this.get('cx');
		const cy = this.get('cy');

		return {
			left: cx - dx,
			top: cy - dy,
			right: cx + dx,
			bottom: cy + dy,
			width,
			height
		};
	}
}

export class ExperimentManager extends Record({
	index: 0,
	patterns: fromJS(patterns),
	width: 64,
	interval: 12,
	xLength: MAX_WIDTH,
	yLength: MAX_HEIGHT,
	blocks: List(),
	dx: 0,
	dy: 0
}) {

	/**
	 * @param {{ width: number, height: number }} args
	 */
	start(args) {
		const { width, height } = args;
		const blockWidth = this.get('width');
		const blockInterval = this.get('interval');
		const xLength = this.get('xLength');
		const yLength = this.get('yLength');
		const dx = (width - blockWidth * xLength - blockInterval * (xLength - 1)) / 2;
		const dy = (height - blockWidth * yLength - blockInterval * (yLength - 1)) / 2;

		return this.merge({
			dx,
			dy
		}).setCurrentBlocks();
	}

	/**
	 * @param {number} index
	 */
	setCurrentBlocks(index) {
		index = index === undefined ? this.get('index') : index;
		const dx = this.get('dx');
		const dy = this.get('dy');
		const width = this.get('width');
		const interval = this.get('interval');
		const pattern = this.getIn(['patterns', index]);
		const patternBlocks = pattern.get('blocks');
		const patternDX = pattern.get('dx');
		const patternDY = pattern.get('dy');
		const xLength = this.get('xLength');
		const yLength = this.get('yLength');
		let blocks = List();

		for (let i = 0; i < xLength; i += 1) {
			for (let j = 0; j < yLength; j += 1) {
				const s = i - patternDX;
				const t = j - patternDY;
				const target = s < 0 || t < 0 ? false : patternBlocks.getIn([t, s]);

				blocks = blocks.push(
					new Block({
						cx: i * (width + interval) + width / 2 + dx,
						cy: j * (width + interval) + width / 2 + dy,
						width: width,
						height: width,
						target: target === undefined ? false : target
					})
				);
			}
		}

		return this.merge({ blocks, index });
	}
}
