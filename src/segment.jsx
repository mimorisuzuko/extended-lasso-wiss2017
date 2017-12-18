import _ from 'lodash';

export default class Segment {
	/**
	 * @param {number} ax
	 * @param {number} ay
	 * @param {number} bx
	 * @param {number} by
	 */
	constructor(ax, ay, bx, by) {
		const slope = (by - ay) / (bx - ax);
		const [minX, maxX] = _.sortBy([ax, bx]);
		const [minY, maxY] = _.sortBy([ay, by]);

		this.slope = slope;
		this.isFiniteSlope = isFinite(slope);
		this.intercept = ay - ax * slope;
		this.startPoint = { x: ax, y: ay };
		this.endPoint = { x: bx, y: by };
		this.minX = minX;
		this.maxX = maxX;
		this.minY = minY;
		this.maxY = maxY;
	}

	/**
	 * @param {Segment} segment 
	 */
	getIntersectionPointOnLine(segment) {
		const { x, y } = this.getIntersectionPoint(segment);

		if (x === null || y === null || !this.on(x, y)) {
			return { x: null, y: null };
		}

		return { x, y };
	}

	/**
	 * @param {Segment} segment
	 */
	getIntersectionPoint(segment) {
		const { isFiniteSlope: aIsFinite, slope: aSlope, intercept: aIntercept, minX: ax } = this;
		const { isFiniteSlope: bIsFinite, slope: bSlope, intercept: bIntercept, minX: bx } = segment;

		if (aIsFinite) {
			if (bIsFinite) {
				if (aSlope === bSlope) {
					return {
						x: null,
						y: null
					};
				}

				const x = -(bIntercept - aIntercept) / (bSlope - aSlope);
				const y = this.y(x);

				return {
					x,
					y
				};
			}

			const x = bx;
			const y = this.y(x);

			return {
				x,
				y
			};
		}

		if (bIsFinite) {
			const x = ax;
			const y = segment.y(x);

			return {
				x,
				y
			};
		}

		return {
			x: null,
			y: null
		};
	}

	/**
	 * @param {number} x
	 * @returns {number} 
	 */
	y(x) {
		const { slope, intercept } = this;

		return slope * x + intercept;
	}

	/**
	 * @param {number} y
	 * @returns {number}
	 */
	x(y) {
		const { slope, intercept } = this;

		return (y - intercept) / slope;
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns {boolean}
	 */
	on(x, y) {
		const { minX, maxX, minY, maxY, slope, isFiniteSlope } = this;

		return (slope === 0 ? minY === y : minY <= y && y < maxY) && (isFiniteSlope ? minX <= x && x < maxX : minX === x);
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns {boolean}
	 */
	isLeftPoint(x, y) {
		const { minX, minY, maxY, slope, isFiniteSlope } = this;

		if (isFiniteSlope) {
			return slope === 0 ? false : minY <= y && y < maxY && x < this.x(y);
		}

		return x < minX && minY <= y && y < maxY;
	}
}
