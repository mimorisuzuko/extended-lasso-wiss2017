import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import autobind from 'autobind-decorator';
import _ from 'lodash';
import Segment from '../segment';
import Block from '../components/Block';
import { connect } from 'react-redux';
import actions from '../actions';
import Slider from '../components/Slider';
import { batchActions } from 'redux-batched-actions';
import './App.scss';

@connect(({ experminetManager }) => ({
	experminetManager
}))
class App extends Component {
	constructor() {
		super();

		this.state = {
			isProposedMethod: true,
			isMouseMove: false,
			/** @type {{ x: number, y: number }[]} */
			drawnPoints: [],
			/** @type {{ x: number, y: number }[]} */
			extensions: null,
			/** @type {{ x: number, y: number }[]} */
			selection: null,
			blocks: []
		};
		this.timer = -1;
		/** @type {SVGElement} */
		this.$svg = null;
		this.selectionSegments = null;
		this.canvasSegments = null;
	}

	componentDidMount() {
		const {
			props: { dispatch },
		} = this;
		const $svg = findDOMNode(this).querySelector('svg');
		const {
			width: width,
			height: height
		} = $svg.getBoundingClientRect();

		this.$svg = $svg;
		this.canvasSegments = [
			new Segment(0, 0, width, 0),
			new Segment(width, 0, width, height),
			new Segment(width, height, 0, height),
			new Segment(0, width, 0, 0)
		];
		dispatch(actions.startExperiment({ width, height }));
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseDownLasso(e) {
		const { currentTarget } = e;
		const { props: { dispatch } } = this;

		currentTarget.addEventListener('mousemove', this.onMouseMoveLasso);
		currentTarget.addEventListener('mouseup', this.onMouseUpLasso);
		dispatch(actions.unselectBlocks());
		this.setState({ selection: null });
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseMoveLasso(e) {
		let { state: { drawnPoints } } = this;

		drawnPoints = this.concatPoints(drawnPoints, this.point(e));

		this.setState({
			isMouseMove: true,
			drawnPoints
		});
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseUpLasso(e) {
		const { currentTarget } = e;
		const {
			state: { drawnPoints },
			props: { dispatch, experminetManager }
		} = this;

		currentTarget.removeEventListener('mousemove', this.onMouseMoveLasso);
		currentTarget.removeEventListener('mouseup', this.onMouseUpLasso);
		const selectionSegments = this.convertPointsToSegments(drawnPoints);
		this.selectionSegments = selectionSegments;
		dispatch(
			actions.selectBlocks(experminetManager.get('blocks').map((block) => {
				if (!selectionSegments) { return false; }

				const { left, top, width, height } = block.getRect();
				const interval = 2;
				const dw = width / interval;
				const dh = height / interval;
				const length = interval + 1;
				let ret = true;

				for (let i = 0; i < length; i += 1) {
					for (let j = 0; j < length; j += 1) {
						const sum = _.sumBy(selectionSegments, (segments) => segments.isLeftPoint(left + dw * i, top + dh * j) ? 1 : 0);
						ret = ret && (sum % 2 === 1);
					}
				}

				return ret;
			}))
		);
		this.setState({
			isMouseMove: false,
			extensions: null,
			drawnPoints: [],
			selection: drawnPoints
		});
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseDownProposed(e) {
		const { currentTarget } = e;

		currentTarget.addEventListener('mouseup', this.onMouseUpProposed);
		this.timer = setTimeout(() => {
			currentTarget.addEventListener('mousemove', this.onMouseMoveProposed);
			this.setState({ drawnPoints: [] });
		}, 50);
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseMoveProposed(e) {
		let { state: { drawnPoints } } = this;

		drawnPoints = this.concatPoints(drawnPoints, this.point(e));
		const segments = this.getDefaultSegments();

		this.setState({
			isMouseMove: true,
			drawnPoints,
			extensions: this.getExtensions(segments, drawnPoints)
		});
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseUpProposed(e) {
		const {
			timer,
			state: { isMouseMove },
			props: { dispatch, experminetManager }
		} = this;
		const { currentTarget } = e;

		currentTarget.removeEventListener('mousemove', this.onMouseMoveProposed);
		currentTarget.removeEventListener('mouseup', this.onMouseUpProposed);
		clearTimeout(timer);

		if (isMouseMove) {
			const selection = this.createSelection(this.getDefaultSegments(), true);
			const selectionSegments = this.convertPointsToSegments(selection);

			this.selectionSegments = selectionSegments;
			dispatch(
				actions.selectBlocks(experminetManager.get('blocks').map((block) => {
					if (!selectionSegments) {
						return false;
					}

					const cx = block.get('cx');
					const cy = block.get('cy');
					const sum = _.sumBy(selectionSegments, (segments) => segments.isLeftPoint(cx, cy) ? 1 : 0);
					return sum % 2 === 1;
				}))
			);
			this.setState({
				isMouseMove: false,
				extensions: null,
				selection
			});
		}
	}

	@autobind
	clearState() {
		this.setState({
			...this.getDefaultState()
		});
	}

	@autobind
	toggleMethod() {
		const { state: { isProposedMethod } } = this;

		this.setState({
			...this.getDefaultState(),
			isProposedMethod: !isProposedMethod
		});
	}

	/**
	 * @param {number} value
	 */
	@autobind
	changeExperimentPattern(value) {
		const { props: { dispatch } } = this;

		this.setState({
			...this.getDefaultState()
		});
		dispatch(batchActions([
			actions.updateExperimentPattern(value),
			actions.unselectBlocks()
		]));
	}

	@autobind
	reload() {
		location.reload();
	}

	/**
	 * @returns {{}}
	 */
	getDefaultState() {
		const { props: { dispatch } } = this;

		dispatch(actions.unselectBlocks());
		this.selectionSegments = null;

		return {
			isMouseMove: false,
			drawnPoints: [],
			extensions: null,
			selection: null,
		};
	}

	getDefaultSegments() {
		const { selectionSegments, canvasSegments } = this;

		return selectionSegments ? selectionSegments : canvasSegments;
	}

	/**
	 * @param {Segment[]} segments
	 * @returns {{ x: number, y: number }[]}
	 */
	createSelection(segments) {
		const { state: { drawnPoints, selection } } = this;
		const { state: { extensions } } = this;
		if (!extensions) { return selection; }

		const { length } = extensions;
		if (length === 1) { return selection; }

		const [
			{ index: headIndex, points: [, headEndPoint] },
			{ index: tailIndex, points: [, tailEndPoint] }
		] = extensions;
		const ret = [...drawnPoints, headEndPoint];
		const { length: segmentsLength } = segments;
		const [
			{ points: [, { x: ax, y: ay }] },
			{ points: [, { x: bx, y: by }] }
		] = extensions;
		const { endPoint: { x: sx, y: sy } } = segments[headIndex];

		if (
			headIndex === tailIndex
			&& Math.sqrt(Math.pow(sx - ax, 2) + Math.pow(sy - ay, 2)) > Math.sqrt(Math.pow(sx - bx, 2) + Math.pow(sy - by, 2))
		) {
			ret.push(tailEndPoint);
		} else {
			let i = headIndex;
			while (true) {
				const { endPoint } = segments[i];
				ret.push(endPoint);
				i += 1;
				i = i === segmentsLength ? 0 : i;
				if (i === tailIndex) {
					const { startPoint } = segments[i];
					ret.push(startPoint, tailEndPoint);
					break;
				}
			}
		}

		return ret;
	}

	/**
	 * @param {{ x: number, y: number }[]} points
	 * @returns {Segment[]} 
	 */
	convertPointsToSegments(points) {
		if (!points) { return null; }

		const ret = [];
		const { length } = points;
		let i = 0;

		while (true) {
			i += 1;
			const { x: ax, y: ay } = points[i - 1];

			if (i === length) {
				const { x: bx, y: by } = points[0];
				ret.push(new Segment(ax, ay, bx, by));
				break;
			} else {
				const { x: bx, y: by } = points[i];
				ret.push(new Segment(ax, ay, bx, by));
			}
		}

		return ret;
	}

	/**
	 * @param {Segment[]} segments
	 * @param {{ x: number, y: number }[]} points
	 */
	getExtensions(segments, points) {
		const filtered = _.filter([
			this.getExtensionPoints(segments, points, true),
			this.getExtensionPoints(segments, points, false)
		], (a) => a);
		const { length } = filtered;

		return length === 0 ? null : filtered;
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns {number}
	 */
	getClosestBlockIndex(x, y) {
		const { props: { experminetManager } } = this;
		const blocks = experminetManager.get('blocks');
		let index = null;
		let dist = Infinity;

		blocks.map((block, i) => {
			const d = Math.sqrt(Math.pow(x - block.get('cx'), 2) + Math.pow(y - block.get('cy'), 2));

			if (d < dist) {
				dist = d;
				index = i;
			}
		});

		return index;
	}

	getSimilarAngleFromClosetBlock(angle, x, y) {
		const { props: { experminetManager } } = this;
		const blocks = experminetManager.get('blocks');
		const closestBlockIndex = this.getClosestBlockIndex(x, y);
		const closestBlock = blocks.get(closestBlockIndex);
		const closestX = closestBlock.get('cx');
		const closestY = closestBlock.get('cy');
		let similarAngle = Infinity;
		let dist = Infinity;

		experminetManager.get('blocks').map((block, i) => {
			if (i === closestBlockIndex) { return; }

			const a = Math.atan2(block.get('cy') - closestY, block.get('cx') - closestX);
			const d = Math.abs(angle - a);

			if (d < 0.5 && d < dist) {
				similarAngle = a;
				dist = d;
			}
		});

		return isFinite(similarAngle) ? similarAngle : angle;
	}

	/**
	 * @param {Segment[]} segments
	 * @param {{ x: number, y: number }[]} points
	 * @param {boolean} reverse
	 * @returns {{ points: { x: number, y: number }[], index: number }}
	 */
	getExtensionPoints(segments, points, reverse = true) {
		const { length } = points;
		const extensionLength = Math.min(length, 20);
		const last = reverse ? length - 1 : 0;
		let i = reverse ? length - extensionLength - 1 : extensionLength - 1;

		if ((reverse && i < 0) || (!reverse && i < 1)) { return null; }

		let vx = 0;
		let vy = 0;

		if (reverse) {
			for (; i < last; i += 1) {
				const { x: ax, y: ay } = points[i];
				const { x: bx, y: by } = points[i + 1];
				const dx = bx - ax;
				const dy = by - ay;
				const dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

				vx += dx / dist / extensionLength;
				vy += dy / dist / extensionLength;
			}
		} else {
			for (; i > last; i -= 1) {
				const { x: ax, y: ay } = points[i];
				const { x: bx, y: by } = points[i - 1];
				const dx = bx - ax;
				const dy = by - ay;
				const dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

				vx += dx / dist / extensionLength;
				vy += dy / dist / extensionLength;
			}
		}

		const { x: lastX, y: lastY } = points[last];
		const angle = this.getSimilarAngleFromClosetBlock(Math.atan2(vy, vx), lastX, lastY);
		const cos = Math.cos(angle);
		const sin = Math.sin(angle);
		const segment = new Segment(lastX, lastY, lastX + cos, lastY + sin);
		let ret = null;
		let dist = Infinity;

		_.forEach(segments, (a, i) => {
			const { x, y } = a.getIntersectionPointOnLine(segment);
			if (x === null || y === null) { return; }

			const dx = x - lastX;
			const dy = y - lastY;
			const norm = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

			if (norm < dist && Math.abs(cos - dx / norm) < 1 && Math.abs(sin - dy / norm) < 1) {
				dist = norm;
				ret = {
					points: [
						{ x: lastX, y: lastY },
						{ x, y }
					],
					index: i
				};
			}
		});

		return ret;
	}

	/**
	 * @param {{ x: number, y: number }[]} points
	 * @param {{ x: number, y: number }} point
	 */
	concatPoints(points, point) {
		const { length } = points;

		if (length === 0) {
			return [point];
		}

		const { x: tailX, y: tailY } = points[length - 1];
		const { x: px, y: py } = point;
		const dx = px - tailX;
		const dy = py - tailY;
		const a = Math.atan2(dy, dx);
		const r = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
		const cos = Math.cos(a);
		const sin = Math.sin(a);

		for (let i = 1; i < r; i += 1) {
			const x = tailX + i * cos;
			const y = tailY + i * sin;

			points.push({ x, y });
		}

		return points;
	}

	/**
	 * @param {MouseEvent} e
	 * @returns {{ x: number, y: number }}
	 */
	point(e) {
		const { clientX, clientY } = e;
		const { $svg } = this;
		const { left, top } = $svg.getBoundingClientRect();

		return {
			x: clientX - left,
			y: clientY - top
		};
	}

	render() {
		const {
			state: { drawnPoints, extensions, selection, isMouseMove, isProposedMethod },
			props: { experminetManager }
		} = this;

		return (
			<div styleName='base'>
				<header>
					<button
						onClick={this.toggleMethod}
						styleName='btn'
					>
						{isProposedMethod ? 'Proposed' : 'Lasso'}
					</button>
					<button
						onClick={this.clearState}
						styleName='btn'
					>
						Clear
					</button>
					<button
						onClick={this.reload}
						styleName='btn'
					>
						Reload
					</button>
					<Slider
						width={480}
						value={experminetManager.get('index')}
						min={0}
						max={experminetManager.get('patterns').size - 1}
						onChange={this.changeExperimentPattern}
					/>
				</header>
				<svg
					shapeRendering='optimizeSpeed'
					onMouseDown={isProposedMethod ? this.onMouseDownProposed : this.onMouseDownLasso}
				>
					{experminetManager.get('blocks').map((a, i) => <Block blockState={a} key={i} center />)}
					{selection ? (
						<polygon
							points={_.map(selection, ({ x, y }) => `${x},${y}`)}
							strokeWidth={3}
							stroke='rgb(0, 122, 204)'
							fill='rgba(0, 122, 204, 0.2)'
						/>
					) : null}
					{isMouseMove ? (
						<polyline
							points={_.map(drawnPoints, ({ x, y }) => `${x},${y}`)}
							stroke='rgb(255, 193, 7)'
							strokeWidth={3}
							fill='none'
						/>
					) : null}
					{extensions ? _.map(extensions, (extension, i) => {
						if (!extension) { return null; }
						const { points } = extension;

						return (
							<polyline
								key={i}
								points={points.map(({ x, y }) => `${x},${y}`)}
								stroke='rgb(255, 193, 7)'
								strokeWidth={3}
								fill='none'
								strokeDasharray='5 5'
							/>
						);
					}) : null}
				</svg>
			</div>
		);
	}
}

export default App;
