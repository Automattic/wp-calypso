/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React, { PureComponent, Component } from 'react';
import { find, noop } from 'lodash';

/**
 * Module variables
 */

class LegendItem extends PureComponent {
	static propTypes = {
		attr: PropTypes.string.isRequired,
		changeHandler: PropTypes.func.isRequired,
		checked: PropTypes.bool.isRequired,
		label: PropTypes.oneOfType( [ PropTypes.object, PropTypes.string ] ),
	};

	clickHandler = () => {
		this.props.changeHandler( this.props.attr );
	};

	render() {
		return (
			<li className="chart__legend-option">
				<label className="chart__legend-label is-selectable">
					<input
						checked={ this.props.checked }
						className="chart__legend-checkbox"
						onChange={ this.clickHandler }
						type="checkbox"
					/>
					<span className={ this.props.className }></span>{ this.props.label }
				</label>
			</li>
		);
	}
}

class Legend extends Component {
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

	onFilterChange = chartItem => {
		this.props.clickHandler( chartItem );
	};

	render() {
		const legendColors = [ 'chart__legend-color is-dark-blue' ],
			activeTab = this.props.activeTab;

		const legendItems = this.props.availableCharts.map( function( legendItem, index ) {
			const colorClass = legendColors[ index ],
				checked = ( -1 !== this.props.activeCharts.indexOf( legendItem ) ),
				tab = find( this.props.tabs, { attr: legendItem } );

			return <LegendItem
				key={ index }
				className={ colorClass }
				label={ tab.label }
				attr={ tab.attr }
				changeHandler={ this.onFilterChange }
				checked={ checked }
			/>;
		}, this );

		return (
			<div className="chart__legend">
				<ul className="chart__legend-options">
					<li className="chart__legend-option" key="default-tab">
						<span className="chart__legend-label">
							<span className="chart__legend-color is-wordpress-blue"></span>
							{ activeTab.label }
						</span>
					</li>
					{ legendItems }
				</ul>
			</div>
		);
	}
}

export default Legend;
