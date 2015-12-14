/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:chart' ),
	noop = require( 'lodash/utility/noop' ),
	throttle = require( 'lodash/function/throttle' );

/**
 * Internal dependencies
 */
var BarContainer = require( './bar-container' ),
	observe = require( 'lib/mixins/data-observe' ),
	touchDetect = require( 'lib/touch-detect' );

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
		if ( this.isMounted() ) {
			var node = this.refs.chart,
				width = node.clientWidth - 82,
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
		}
	},

	getYAxisMax: function( values ) {
		var max = Math.max.apply( null, values ),
			operand = Math.pow( 10, ( max.toString().length - 1 ) ),
			rounded = ( Math.ceil( ( max + 1 ) / operand ) * operand );

		if ( rounded < 10 ) {
			rounded = 10;
		}

		return rounded;
	},

	getData: function() {
		var data = this.props.data;

		data = data.slice( 0 - this.state.maxBars );

		return data;
	},

	getValues: function() {
		var data = this.getData();

		data = data.map( function ( item ) {
			return item.value;
		}, this );

		return data;
	},

	isEmptyChart: function( values ) {
		values = values.filter( function( value ) {
			return value > 0;
		}, this );

		return values.length === 0;
	},

	render: function() {
		debug( 'Rendering chart with props: ', this.props );

		var values = this.getValues(),
			yAxisMax = this.getYAxisMax( values ),
			data = this.getData(),
			emptyChart;

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
			<div ref="chart" className='chart'>
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
				<BarContainer barClick={ this.props.barClick } data={ data } yAxisMax={ yAxisMax } chartWidth={ this.state.width } isTouch={ touchDetect.hasTouch() } />
				{ emptyChart }
			</div>
		);
	}
} );
