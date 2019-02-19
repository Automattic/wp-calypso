/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import afterLayoutFlush from 'lib/after-layout-flush';
import { hasTouch } from 'lib/touch-detect';
import Tooltip from 'components/tooltip';
import Notice from 'components/notice';
import isRtlSelector from 'state/selectors/is-rtl';
import BarContainer from './bar-container';

/**
 * Style dependencies
 */
import './style.scss';

class Chart extends React.Component {
	state = {
		data: [],
		isEmptyChart: false,
		maxBars: 100, // arbitrarily high number. This will be calculated by resize method
		width: 650,
		yMax: 0,
		isTooltipVisible: false,
		hasResized: false,
	};

	static propTypes = {
		barClick: PropTypes.func,
		data: PropTypes.array,
		isRtl: PropTypes.bool,
		loading: PropTypes.bool,
		minBarWidth: PropTypes.number,
		minTouchBarWidth: PropTypes.number,
		numberFormat: PropTypes.func,
		translate: PropTypes.func,
	};

	static defaultProps = {
		barClick: noop,
		minBarWidth: 15,
		minTouchBarWidth: 42,
	};

	componentDidMount() {
		if ( this.props.data && this.props.data.length && ! this.props.loading ) {
			this.resize();
		}

		this.resize = afterLayoutFlush( this.resize );
		window.addEventListener( 'resize', this.resize );
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.loading && ! this.props.loading ) {
			return this.resize();
		}

		if ( prevProps.data !== this.props.data ) {
			this.updateData( this.props.data );
		}
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.resize );
	}

	resize = () => {
		if ( ! this.chart ) {
			return;
		}

		const isTouch = hasTouch();
		const clientWidth = this.chart.clientWidth - 82;
		const minWidth = isTouch ? this.props.minTouchBarWidth : this.props.minBarWidth;
		const width = isTouch && clientWidth <= 0 ? 350 : clientWidth; // mobile safari bug with zero width
		const maxBars = Math.floor( width / minWidth );

		const updatedData = this.calculateUpdatedData( this.props.data, maxBars );

		this.setState( { maxBars, width, hasResized: true, ...updatedData } );
	};

	getYAxisMax = values => {
		// Calculate max value in the dataset.
		const max = Math.max.apply( null, values );
		if ( 0 === max ) {
			return 2;
		}

		const log10 = Math.log10( max );
		const sign = Math.sign( log10 );

		// Magnitude of the number by a factor fo 10 (e.g. thousands, hundreds, tens, ones, tenths, hundredths, thousandths).
		const magnitude = Math.ceil( Math.abs( log10 ) ) * sign;

		// Determine the base unit size, based on the magnitude of the number.
		const unitSize =
			sign > 0 && 1 < magnitude ? Math.pow( 10, magnitude - sign ) : Math.pow( 10, magnitude );

		// Determine how many units are needed to accommodate the chart's max value.
		const numberOfUnits = Math.ceil( max / unitSize );

		return unitSize * numberOfUnits;
	};

	storeChart = ref => ( this.chart = ref );

	calculateUpdatedData = ( data, maxBars ) => {
		const nextData = data.length <= maxBars ? data : data.slice( 0 - maxBars );
		const nextVals = data.map( ( { value } ) => value );

		return {
			data: nextData,
			isEmptyChart: Boolean( nextVals.length && ! nextVals.some( a => a > 0 ) ),
			yMax: this.getYAxisMax( nextVals ),
		};
	};

	updateData = data => {
		this.setState( state => this.calculateUpdatedData( data, state.maxBars ) );
	};

	setTooltip = ( tooltipContext, tooltipPosition, tooltipData ) => {
		if ( ! tooltipContext || ! tooltipPosition || ! tooltipData ) {
			return this.setState( { isTooltipVisible: false } );
		}

		this.setState( { tooltipContext, tooltipPosition, tooltipData, isTooltipVisible: true } );
	};

	render() {
		const { barClick, translate, numberFormat } = this.props;
		const {
			data,
			isEmptyChart,
			width,
			yMax,
			isTooltipVisible,
			tooltipContext,
			tooltipPosition,
			tooltipData,
			hasResized,
		} = this.state;

		if ( ! hasResized ) {
			return <div ref={ this.storeChart } className="chart" />;
		}

		return (
			<div ref={ this.storeChart } className="chart">
				<div className="chart__y-axis-markers">
					<div className="chart__y-axis-marker is-hundred" />
					<div className="chart__y-axis-marker is-fifty" />
					<div className="chart__y-axis-marker is-zero" />

					{ isEmptyChart && (
						<div className="chart__empty">
							<Notice
								className="chart__empty-notice"
								status="is-warning"
								isCompact
								text={ translate( 'No activity this period', {
									context: 'Message on empty bar chart in Stats',
									comment: 'Should be limited to 32 characters to prevent wrapping',
								} ) }
								showDismiss={ false }
							/>
						</div>
					) }
				</div>
				<div className="chart__y-axis">
					<div className="chart__y-axis-width-fix">{ numberFormat( 100000 ) }</div>
					<div className="chart__y-axis-label is-hundred">
						{ yMax > 1 ? numberFormat( yMax ) : numberFormat( yMax, 2 ) }
					</div>
					<div className="chart__y-axis-label is-fifty">
						{ yMax > 1 ? numberFormat( yMax / 2 ) : numberFormat( yMax / 2, 2 ) }
					</div>
					<div className="chart__y-axis-label is-zero">{ numberFormat( 0 ) }</div>
				</div>
				<BarContainer
					barClick={ barClick }
					chartWidth={ width }
					data={ data }
					isRtl={ this.props.isRtl }
					isTouch={ hasTouch() }
					setTooltip={ this.setTooltip }
					yAxisMax={ yMax }
				/>
				{ isTooltipVisible && (
					<Tooltip
						className="chart__tooltip"
						id="popover__chart-bar"
						context={ tooltipContext }
						isVisible={ isTooltipVisible }
						position={ tooltipPosition }
					>
						<ul>{ tooltipData }</ul>
					</Tooltip>
				) }
			</div>
		);
	}
}

export default connect( state => ( {
	isRtl: isRtlSelector( state ),
} ) )( localize( Chart ) );
