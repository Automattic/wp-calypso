/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { find, noop } from 'lodash';

/**
 * Internal dependencies
 */
import ChartLegendItem from './legend-item';

export default class ChartLegend extends React.Component {
	static propTypes = {
		activeCharts: PropTypes.array,
		activeTab: PropTypes.object.isRequired,
		availableCharts: PropTypes.array,
		clickHandler: PropTypes.func,
		tabs: PropTypes.array,
	};

	static defaultProps = {
		activeCharts: [],
		availableCharts: [],
		clickHandler: noop,
		tabs: [],
	};

	onFilterChange = ( chartItem ) => {
		this.props.clickHandler( chartItem );
	};

	render() {
		const legendColors = [ 'chart__legend-color is-dark-blue' ],
			activeTab = this.props.activeTab;

		const legendItems = this.props.availableCharts.map( function ( legendItem, index ) {
			const colorClass = legendColors[ index ],
				checked = -1 !== this.props.activeCharts.indexOf( legendItem ),
				tab = find( this.props.tabs, { attr: legendItem } );
			return (
				<ChartLegendItem
					key={ index }
					className={ colorClass }
					label={ tab.label }
					attr={ tab.attr }
					changeHandler={ this.onFilterChange }
					checked={ checked }
				/>
			);
		}, this );

		return (
			<div className="chart__legend">
				<ul className="chart__legend-options">
					<li className="chart__legend-option" key="default-tab">
						<span className="chart__legend-label">
							<span className="chart__legend-color is-wordpress-blue" />
							{ activeTab.label }
						</span>
					</li>
					{ legendItems }
				</ul>
			</div>
		);
	}
}
