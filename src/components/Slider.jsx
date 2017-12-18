import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import autobind from 'autobind-decorator';
import './Slider.scss';

const height = 24;

export default class Slider extends Component {
	constructor() {
		super();

		/** @type {HTMLCanvasElement} */
		this.$e = null;
		/** @type {CanvasRenderingContext2D} */
		this.ctx = null;
	}

	componentDidMount() {
		const $e = findDOMNode(this).querySelector('canvas');

		this.$e = $e;
		this.ctx = $e.getContext('2d');
		this.renderCanvas();
	}

	componentDidUpdate() {
		this.renderCanvas();
	}

	/**
	 * @param {MouseEvent} e
	 * @returns {number}
	 */
	value(e) {
		const { $e, props: { min, max } } = this;
		const { left, width } = $e.getBoundingClientRect();
		const { clientX } = e;
		const nx = Math.min(1, Math.max(0, (clientX - left) / width));

		return Math.floor((max - min) * nx + min);
	}

	/**
	 * @param {MouseEvent} e 
	 */
	@autobind
	onMouseDown(e) {
		const { props: { onChange } } = this;

		onChange(this.value(e));
		document.addEventListener('mousemove', this.onMouseMove);
		document.addEventListener('mouseup', this.onMouseUp);
	}

	/**
	 * @param {MouseEvent} e
	 */
	@autobind
	onMouseMove(e) {
		const { props: { onChange } } = this;

		onChange(this.value(e));
	}

	@autobind
	onMouseUp() {
		document.removeEventListener('mousemove', this.onMouseMove);
		document.removeEventListener('mouseup', this.onMouseUp);
	}

	renderCanvas() {
		const { props: { value, min, max, width }, ctx } = this;
		const rate = (value - min) / (max - min);

		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, rate * width, height);
	}

	render() {
		const { props: { width, value } } = this;

		return (
			<span styleName='base'>
				<canvas
					onMouseDown={this.onMouseDown}
					styleName='base'
					width={width}
					height={height}
				/>
				<span>{value}</span>
			</span>
		);
	}
}
