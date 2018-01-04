/** @format */
/**
 * External dependencies
 */
import * as React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Bar from './bar';
import XAxis from './x-axis';
import userModule from 'lib/user';

/**
 * Module variables
 */
const user = userModule();

const getTooltipPosition = ( width, barWidth, index, isRTL ) => {
	const offset = barWidth * ( index + 1 );

	// eslint-disable-next-line no-nested-ternary
	return offset + 230 > width && offset + barWidth - 230 > 0
		? isRTL ? 'bottom right' : 'bottom left'
		: isRTL ? 'bottom left' : 'bottom right';
};

export class BarContainer extends React.PureComponent {
	static propTypes = {
		isTouch: PropTypes.bool,
		data: PropTypes.array,
		yAxisMax: PropTypes.number,
		width: PropTypes.number,
		barClick: PropTypes.func,
	};

	render() {
		const { barClick: clickHandler, chartWidth: width, data, isTouch, yAxisMax: max } = this.props;
		const count = data.length;
		const barWidth = width / count;
		const isRTL = user.isRTL();

		return (
			<div>
				<div className="chart__bars">
					{ data.map( ( item, index ) => (
						<Bar
							{ ...{
								key: index,
								className: item.className,
								clickHandler,
								count,
								data: item,
								index,
								isTouch,
								max,
								tooltipPosition: getTooltipPosition( width, barWidth, index, isRTL ),
							} }
						/>
					) ) }
				</div>
				<XAxis data={ data } labelWidth={ 42 } />
			</div>
		);
	}
}

export default BarContainer;
