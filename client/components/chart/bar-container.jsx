/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';

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

export default class extends React.Component {
	static displayName = 'ModuleChartBarContainer';

	static propTypes = {
		isTouch: PropTypes.bool,
		data: PropTypes.array,
		yAxisMax: PropTypes.number,
		width: PropTypes.number,
		barClick: PropTypes.func
	};

	buildBars = max => {
		const numberBars = this.props.data.length,
			width = this.props.chartWidth,
			barWidth = ( width / numberBars );
		let tooltipPosition = user.isRTL() ? 'bottom left' : 'bottom right';

		const bars = this.props.data.map( function( item, index ) {
			const barOffset = barWidth * ( index + 1 );

			if ( ( ( barOffset + 230 ) > width ) && ( ( ( barOffset + barWidth ) - 230 ) > 0 ) ) {
				tooltipPosition = user.isRTL() ? 'bottom right' : 'bottom left';
			}

			return <Bar index={ index }
						key={ index }
						isTouch={ this.props.isTouch }
						tooltipPosition={ tooltipPosition }
						className={ item.className }
						clickHandler={ this.props.barClick }
						data={ item }
						max={ max }
						count={ numberBars } />;
		}, this );

		return bars;
	};

	render() {
		return (
			<div>
				<div className="chart__bars">
					{ this.buildBars( this.props.yAxisMax ) }
				</div>
				<XAxis data={ this.props.data } labelWidth={ 42 } />
			</div>
		);
	}
}
