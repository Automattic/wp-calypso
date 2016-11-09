/**
 * External dependencies
 */
import React from 'react';
import { some, noop, throttle } from 'lodash';

/**
 * Internal dependencies
 */
import BarContainer from './bar-container';
import observe from 'lib/mixins/data-observe';
import touchDetect from 'lib/touch-detect';

module.exports = React.createClass( {
	displayName: 'ModuleChart',

	mixins: [ observe( 'dataList' ) ],

	propTypes: {
		loading: React.PropTypes.bool,
		data: React.PropTypes.array,
		minTouchBarWidth: React.PropTypes.number,
		minBarWidth: React.PropTypes.number,
		barClick: React.PropTypes.func
	},

	getInitialState: function() {
		return {
			maxBars: 100, // arbitrarily high number. This will be calculated by resize method
			width: 650
		};
	},

	getDefaultProps: function() {
		return {
			minTouchBarWidth: 42,
			minBarWidth: 15,
			barClick: noop
		};
	},

	// Add listener for window resize
	componentDidMount: function() {
		this.resize = throttle( this.resize, 400 );
		window.addEventListener( 'resize', this.resize );
		this.resize();
	},

	// Remove listener
	componentWillUnmount: function() {
		window.removeEventListener( 'resize', this.resize );
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( this.props.loading && ! nextProps.loading ) {
			this.resize();
		}
	},

	resize: function() {
		const node = this.refs.chart;
		let width = node.clientWidth - 82,
			maxBars;

		if ( touchDetect.hasTouch() ) {
			width = ( width <= 0 ) ? 350 : width; // mobile safari bug with zero width
			maxBars = Math.floor( width / this.props.minTouchBarWidth );
		} else {
			maxBars = Math.floor( width / this.props.minBarWidth );
		}

		this.setState( {
			maxBars: maxBars,
			width: width
		} );
	},

	getYAxisMax: function( values ) {
		const max = Math.max.apply( null, values ),
			operand = Math.pow( 10, ( max.toString().length - 1 ) );
		let rounded = ( Math.ceil( ( max + 1 ) / operand ) * operand );

		if ( rounded < 10 ) {
			rounded = 10;
		}

		return rounded;
	},

	getData: function() {
		let data = this.props.data;

		data = data.slice( 0 - this.state.maxBars );

		return data;
	},

	getValues: function() {
		let data = this.getData();

		data = data.map( function( item ) {
			return item.value;
		}, this );

		return data;
	},

	isEmptyChart: function( values ) {
		return ! some( values, ( value ) => value > 0 );
	},

	render: function() {
		const values = this.getValues(),
			yAxisMax = this.getYAxisMax( values ),
			data = this.getData();
		let	emptyChart;

		// If we have an empty chart, show a message
		// @todo this message needs to either use a <Notice> or make a custom "chart__notice" class
		if ( values.length && this.isEmptyChart( values ) ) {
			emptyChart = (
				<div className="chart__empty">
					<span className="chart__empty_notice">
						{ this.translate( 'No activity this period', {
							context: 'Message on empty bar chart in Stats',
							comment: 'Should be limited to 32 characters to prevent wrapping'
						} ) }
					</span>
				</div>
			);
		}

		return (
			<div ref="chart" className="chart">
				<div className="chart__y-axis-markers">
					<div className="chart__y-axis-marker is-hundred"></div>
					<div className="chart__y-axis-marker is-fifty"></div>
					<div className="chart__y-axis-marker is-zero"></div>
				</div>
				<div className="chart__y-axis">
					<div className="chart__y-axis-width-fix">{ this.numberFormat( 100000 ) }</div>
					<div className="chart__y-axis-label is-hundred">{ this.numberFormat( yAxisMax ) }</div>
					<div className="chart__y-axis-label is-fifty">{ this.numberFormat( yAxisMax / 2 ) }</div>
					<div className="chart__y-axis-label is-zero">{ this.numberFormat( 0 ) }</div>
				</div>
				<BarContainer
					barClick={ this.props.barClick }
					data={ data }
					yAxisMax={ yAxisMax }
					chartWidth={ this.state.width }
					isTouch={ touchDetect.hasTouch() }
				/>
				{ emptyChart }
			</div>
		);
	}
} );
