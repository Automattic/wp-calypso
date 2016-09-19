/**
 * External dependencies
 */
import React from 'react';
import { find } from 'lodash';

/**
 * Module variables
 */
// TODO: remove and extend from PureComponent after porting the component to ES6
const PureRenderMixin = require( 'react-pure-render/mixin' );

const LegendItem = React.createClass( {
	displayName: 'ModuleChartLegendItem',

	mixins: [ PureRenderMixin ],

	propTypes: {
		checked: React.PropTypes.bool.isRequired,
		label: React.PropTypes.oneOfType( [ React.PropTypes.object, React.PropTypes.string ] ),
		attr: React.PropTypes.string.isRequired,
		changeHandler: React.PropTypes.func.isRequired
	},

	clickHandler: function() {
		this.props.changeHandler( this.props.attr );
	},

	render: function() {
		return (
			<li className="chart__legend-option">
				<label htmlFor="checkbox" className="chart__legend-label is-selectable" onClick={ this.clickHandler } >
					<input type="checkbox" className="chart__legend-checkbox" checked={ this.props.checked } onChange={ function() {} } />
					<span className={ this.props.className }></span>{ this.props.label }
				</label>
			</li>
		);
	}

} );

const Legend = React.createClass( {
	displayName: 'ModuleChartLegend',

	propTypes: {
		activeTab: React.PropTypes.object.isRequired,
		tabs: React.PropTypes.array.isRequired,
		activeCharts: React.PropTypes.array.isRequired,
		availableCharts: React.PropTypes.array.isRequired,
		clickHandler: React.PropTypes.func.isRequired
	},

	onFilterChange: function( chartItem ) {
		this.props.clickHandler( chartItem );
	},

	render: function() {
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
} );

module.exports = Legend;
