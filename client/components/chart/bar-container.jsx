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

const X_AXIS_LABEL_WIDTH = 42;

export default class ChartBarContainer extends React.PureComponent {
	static propTypes = {
		barClick: PropTypes.func,
		data: PropTypes.array,
		isPlaceholder: PropTypes.bool,
		isRtl: PropTypes.bool,
		isTouch: PropTypes.bool,
		width: PropTypes.number,
		yAxisMax: PropTypes.number,
	};

	static defaultProps = {
		isPlaceholder: false,
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
						/>
					) ) }
				</div>
				{ ! this.props.isPlaceholder && (
					<XAxis
						data={ this.props.data }
						labelWidth={ X_AXIS_LABEL_WIDTH }
						isRtl={ this.props.isRtl }
						chartWidth={ this.props.chartWidth }
					/>
				) }
			</>
		);
	}
}
