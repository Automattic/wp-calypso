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

export default class ChartBarContainer extends React.PureComponent {
	static propTypes = {
		barClick: PropTypes.func,
		data: PropTypes.array,
		isRtl: PropTypes.bool,
		isTouch: PropTypes.bool,
		width: PropTypes.number,
		yAxisMax: PropTypes.number,
	};

	render() {
		return (
			<>
				<div className="chart__bars">
					{ this.props.data.map( ( item, index ) => (
						<Bar
							index={ index }
							key={ index }
							isTouch={ this.props.isTouch }
							className={ item.className }
							clickHandler={ this.props.barClick }
							data={ item }
							max={ this.props.yAxisMax }
							count={ this.props.data.length }
							chartWidth={ this.props.chartWidth }
							setTooltip={ this.props.setTooltip }
							isRtl={ this.props.isRtl }
						/>
					) ) }
				</div>
				<XAxis data={ this.props.data } labelWidth={ 42 } isRtl={ this.props.isRtl } />
			</>
		);
	}
}
