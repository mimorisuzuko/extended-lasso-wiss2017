import React, { PureComponent } from 'react';

const STROKE_WIDTH = 3;
const STROKE_DOUBLE_WIDTH = STROKE_WIDTH * 2;
const CENTER_WIDTH = 10;
const CENTER_HALF_WIDTH = CENTER_WIDTH / 2;

class Block extends PureComponent {
	render() {
		const { props: { blockState, center } } = this;
		const width = blockState.get('width');
		const height = blockState.get('height');
		const x = blockState.get('cx') - width / 2;
		const y = blockState.get('cy') - height / 2;
		const selected = blockState.get('selected');
		const target = blockState.get('target');
		const delta = width / 2;

		return (
			<g>
				<rect
					x={x}
					y={y}
					width={width}
					height={height}
					fill={!target && selected ? 'rgb(255, 8, 0)' : 'black'}
				/>
				<rect
					x={x + STROKE_WIDTH}
					y={y + STROKE_WIDTH}
					width={width - STROKE_DOUBLE_WIDTH}
					height={height - STROKE_DOUBLE_WIDTH}
					fill={selected ? 'rgb(255, 194, 0)' : target ? 'rgb(191, 235, 199)' : 'white'}
				/>
				{center ? (
					<g>
						<rect
							x={x + delta - CENTER_HALF_WIDTH}
							y={y + delta}
							width={CENTER_WIDTH}
							height={1}
							fill='black'
							stroke='none'
						/>
						<rect
							x={x + delta}
							y={y + delta - CENTER_HALF_WIDTH}
							width={1}
							height={CENTER_WIDTH}
							fill='black'
							stroke='none'
						/>
					</g>
				) : null}
			</g>
		);
	}
}

export default Block;
