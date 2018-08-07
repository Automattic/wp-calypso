/** @format */

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

export default class extends React.Component {
	static displayName = 'ModuleChartBarContainer';

	static propTypes = {
		isTouch: PropTypes.bool,
		data: PropTypes.array,
		yAxisMax: PropTypes.number,
		width: PropTypes.number,
		barClick: PropTypes.func,
		isRtl: PropTypes.bool,
	};

	buildBars = max => {
		return this.props.data.map( function( item, index ) {
			return (
				<Bar
					index={ index }
					key={ index }
					isTouch={ this.props.isTouch }
					className={ item.className }
					clickHandler={ this.props.barClick }
					data={ item }
					max={ max }
					count={ this.props.data.length }
					chartWidth={ this.props.chartWidth }
					setTooltip={ this.props.setTooltip }
					isRtl={ this.props.isRtl }
				/>
			);
		}, this );
	};

	render() {
		return (
			<div>
				<div className="chart__bars">{ this.buildBars( this.props.yAxisMax ) }</div>
				<XAxis data={ this.props.data } labelWidth={ 42 } />
			</div>
		);
	}
}
