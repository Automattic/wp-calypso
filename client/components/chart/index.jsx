/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { some, noop, throttle } from 'lodash';

/**
 * Internal dependencies
 */
import BarContainer from './bar-container';
import touchDetect from 'lib/touch-detect';

class ModuleChartExport extends React.Component {
	state = {
		maxBars: 100, // arbitrarily high number. This will be calculated by resize method
		width: 650
	};

	static propTypes = {
		loading: PropTypes.bool,
		data: PropTypes.array,
		minTouchBarWidth: PropTypes.number,
		minBarWidth: PropTypes.number,
		barClick: PropTypes.func,
		translate: PropTypes.func,
		numberFormat: PropTypes.func,
	};

	static defaultProps = {
		minTouchBarWidth: 42,
		minBarWidth: 15,
		barClick: noop
	};

	// Add listener for window resize
	componentDidMount() {
		this.resize = throttle( this.resize, 400 );
		window.addEventListener( 'resize', this.resize );
		this.resize();
	}

	// Remove listener
	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resize );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.loading && ! nextProps.loading ) {
			this.resize();
		}
	}

	resize() {
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
	}

	getYAxisMax( values ) {
		const max = Math.max.apply( null, values ),
			operand = Math.pow( 10, ( Math.floor( max ).toString().length - 1 ) );
		let rounded = ( Math.ceil( ( max + 1 ) / operand ) * operand );

		if ( rounded < 10 ) {
			rounded = 10;
		}

		return rounded;
	}

	getData() {
		let data = this.props.data;

		data = data.slice( 0 - this.state.maxBars );

		return data;
	}

	getValues() {
		let data = this.getData();

		data = data.map( function( item ) {
			return item.value;
		}, this );

		return data;
	}

	isEmptyChart( values ) {
		return ! some( values, ( value ) => value > 0 );
	}

	render() {
		const values = this.getValues(),
			yAxisMax = this.getYAxisMax( values ),
			data = this.getData();
		let	emptyChart;

		const {
			translate,
			numberFormat
		} = this.props;

		// If we have an empty chart, show a message
		// @todo this message needs to either use a <Notice> or make a custom "chart__notice" class
		if ( values.length && this.isEmptyChart( values ) ) {
			emptyChart = (
				<div className="chart__empty">
					<span className="chart__empty-notice">
						{ translate( 'No activity this period', {
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
					<div className="chart__y-axis-width-fix">{ numberFormat( 100000 ) }</div>
					<div className="chart__y-axis-label is-hundred">{ numberFormat( yAxisMax ) }</div>
					<div className="chart__y-axis-label is-fifty">{ numberFormat( yAxisMax / 2 ) }</div>
					<div className="chart__y-axis-label is-zero">{ numberFormat( 0 ) }</div>
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
}

export default localize( ModuleChartExport );
