/** @format */
/**
 * External dependencies
 */
import * as React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { noop, throttle } from 'lodash';

/**
 * Internal dependencies
 */
import BarContainer from './bar-container';
import { hasTouch } from 'lib/touch-detect';

class Chart extends React.Component {
	state = {
		data: [],
		isEmptyChart: false,
		maxBars: 100, // arbitrarily high number. This will be calculated by resize method
		width: 650,
		yMax: 0,
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
		barClick: noop,
	};

	componentDidMount() {
		this.resize = throttle( this.resize, 400 );
		window.addEventListener( 'resize', this.resize );

		this.resize( this.props );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resize );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props.loading && ! nextProps.loading ) {
			return this.resize( nextProps );
		}

		if ( nextProps.data !== this.props.data ) {
			this.updateData( nextProps );
		}
	}

	resize = props => {
		if ( ! this.chart ) {
			return;
		}

		const isTouch = hasTouch();
		const clientWidth = this.chart.clientWidth - 82;
		const minWidth = isTouch ? this.props.minTouchBarWidth : this.props.minBarWidth;
		const width = isTouch && clientWidth <= 0 ? 350 : clientWidth; // mobile safari bug with zero width
		const maxBars = Math.floor( width / minWidth );

		this.setState( { maxBars, width }, () =>
			// this may get called either directly or as a resize event callback
			this.updateData( props instanceof Event ? this.props : props )
		);
	};

	getYAxisMax = values => {
		const max = Math.max.apply( null, values );
		const operand = Math.pow( 10, Math.floor( max ).toString().length - 1 );
		const rounded = Math.ceil( ( max + 1 ) / operand ) * operand;

		return Math.max( 10, rounded );
	};

	storeChart = ref => ( this.chart = ref );

	updateData = ( { data = [] } = {} ) => {
		const { maxBars } = this.state;

		const nextData = data.length <= maxBars ? data : data.slice( 0 - maxBars );
		const nextVals = data.map( ( { value } ) => value );

		this.setState( {
			data: nextData,
			isEmptyChart: nextVals.length && ! nextVals.some( a => a > 0 ),
			yMax: this.getYAxisMax( nextVals ),
		} );
	};

	render() {
		const { barClick, translate, numberFormat } = this.props;
		const { data, isEmptyChart, width, yMax } = this.state;

		return (
			<div ref={ this.storeChart } className="chart">
				<div className="chart__y-axis-markers">
					<div className="chart__y-axis-marker is-hundred" />
					<div className="chart__y-axis-marker is-fifty" />
					<div className="chart__y-axis-marker is-zero" />
				</div>
				<div className="chart__y-axis">
					<div className="chart__y-axis-width-fix">{ numberFormat( 100000 ) }</div>
					<div className="chart__y-axis-label is-hundred">{ numberFormat( yMax ) }</div>
					<div className="chart__y-axis-label is-fifty">{ numberFormat( yMax / 2 ) }</div>
					<div className="chart__y-axis-label is-zero">{ numberFormat( 0 ) }</div>
				</div>
				<BarContainer
					barClick={ barClick }
					data={ data }
					yAxisMax={ yMax }
					chartWidth={ width }
					isTouch={ hasTouch() }
				/>
				{ isEmptyChart && (
					<div className="chart__empty">
						{ /* @todo this message needs to either use a <Notice> or make a custom "chart__notice" class */ }
						<span className="chart__empty-notice">
							{ translate( 'No activity this period', {
								context: 'Message on empty bar chart in Stats',
								comment: 'Should be limited to 32 characters to prevent wrapping',
							} ) }
						</span>
					</div>
				) }
			</div>
		);
	}
}

export default localize( Chart );
