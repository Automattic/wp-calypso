import { Tooltip } from '@automattic/components';
import clsx from 'clsx';
import { localize, withRtl } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState, useCallback, useMemo, useEffect } from 'react';
import Notice from 'calypso/components/notice';
import { hasTouch } from 'calypso/lib/touch-detect';
import { useWindowResizeCallback } from 'calypso/lib/track-element-size';
import BarContainer from './bar-container';

import './style.scss';

const isTouch = hasTouch();

/**
 * Auxiliary method to calculate the maximum value for the Y axis, based on a dataset.
 * @param {Array} values An array of numeric values.
 * @returns {number} The maximum value for the Y axis.
 */
function getYAxisMax( values ) {
	// Calculate max value in a dataset.
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
}

// The Chart component.
function Chart( {
	barClick,
	children,
	data,
	isPlaceholder = false,
	isRtl,
	minBarWidth = 15,
	minTouchBarWidth = 42,
	numberFormat,
	translate,
	chartXPadding = 20,
	sliceFromBeginning = true,
	onChangeMaxBars,
	minBarsToBeShown,
	hideYAxis = false,
	hideXAxis = false,
} ) {
	const [ tooltip, setTooltip ] = useState( { isTooltipVisible: false } );
	const [ sizing, setSizing ] = useState( { clientWidth: 0, hasResized: false } );
	const [ yAxisSize, setYAxisSize ] = useState( { clientWidth: 0, hasResized: false } );

	// Callback to handle tooltip changes.
	// Needs to be memoized to avoid assigning children a new function every render.
	const handleTooltipChange = useCallback( ( tooltipContext, tooltipPosition, tooltipData ) => {
		if ( ! tooltipContext || ! tooltipPosition || ! tooltipData ) {
			setTooltip( { isTooltipVisible: false } );
		} else {
			setTooltip( { tooltipContext, tooltipPosition, tooltipData, isTooltipVisible: true } );
		}
	}, [] );

	const handleYAxisSizeChange = ( contentRect ) => {
		if ( ! contentRect ) {
			return;
		}
		setYAxisSize( ( prevSizing ) => {
			const clientWidth = contentRect.width;
			if ( ! prevSizing.hasResized || clientWidth !== prevSizing.clientWidth ) {
				return { clientWidth, hasResized: true };
			}
			return prevSizing;
		} );
	};

	const yAxisRef = useWindowResizeCallback( handleYAxisSizeChange );

	// Callback to handle element size changes.
	// Needs to be memoized to avoid causing the `useWindowResizeCallback` custom hook to re-subscribe.
	const handleContentRectChange = useCallback(
		( contentRect ) => {
			if ( ! contentRect ) {
				return;
			}
			setSizing( ( prevSizing ) => {
				const effectiveYAxisSize =
					yAxisRef && yAxisRef.current ? yAxisRef.current.clientWidth : yAxisSize.clientWidth;
				const clientWidth = contentRect.width - effectiveYAxisSize;
				if ( ! prevSizing.hasResized || clientWidth !== prevSizing.clientWidth ) {
					return { clientWidth, hasResized: true };
				}
				return prevSizing;
			} );
		},
		[ yAxisRef, yAxisSize.clientWidth ]
	);

	// Subscribe to changes to element size and position.
	const resizeRef = useWindowResizeCallback( handleContentRectChange );

	const minWidth = isTouch ? minTouchBarWidth : minBarWidth;

	const width = isTouch && sizing.clientWidth <= 0 ? 350 : sizing.clientWidth - chartXPadding; // mobile safari bug with zero width
	// Max number of bars that can fit in the chart. If minBarsToBeShown is set, use that instead.
	const maxBars = minBarsToBeShown ?? Math.floor( width / minWidth );

	useEffect( () => {
		if ( onChangeMaxBars ) {
			onChangeMaxBars( maxBars );
		}
	}, [ maxBars, onChangeMaxBars ] );

	useEffect( () => {
		// Invalidate (hide) the tooltip if the underlying data changes.
		setTooltip( { isTooltipVisible: false } );
	}, [ data ] );

	// Memoize data calculations to avoid performing them too often.
	const { chartData, isEmptyChart, yMax } = useMemo( () => {
		const nextData = ( () => {
			if ( data.length > maxBars ) {
				if ( sliceFromBeginning ) {
					return data.slice( 0 - maxBars );
				}
				return data.slice( 0, maxBars );
			}
			return data;
		} )();

		const nextVals = nextData.map( ( { value } ) => value );

		return {
			chartData: nextData,
			isEmptyChart: Boolean( ! nextVals.some( ( a ) => a > 0 ) ),
			yMax: getYAxisMax( nextVals ),
		};
	}, [ data, maxBars, sliceFromBeginning ] );

	const { isTooltipVisible, tooltipContext, tooltipPosition, tooltipData } = tooltip;

	const ChartYAxis = () => (
		<div ref={ yAxisRef } className="chart__y-axis">
			<div className="chart__y-axis-width-spacer">{ numberFormat( 1e5 ) }</div>
			<div className="chart__y-axis-label is-hundred">
				{ yMax > 1 ? numberFormat( yMax ) : numberFormat( yMax, { decimals: 2 } ) }
			</div>
			<div className="chart__y-axis-label is-fifty">
				{ yMax > 1 ? numberFormat( yMax / 2 ) : numberFormat( yMax / 2, { decimals: 2 } ) }
			</div>
			<div className="chart__y-axis-label is-zero">{ numberFormat( 0 ) }</div>
		</div>
	);

	// This is a hack to avoid the flickering on page load.
	// The component listens on the resize event of its own, which would resize on initialization.
	// The hack renders an empty div, which triggers the resize event, and then the actual component would be rendered.
	if ( sizing.clientWidth <= 0 || yAxisSize.clientWidth <= 0 ) {
		return (
			<div ref={ resizeRef } className="chart">
				<ChartYAxis />
			</div>
		);
	}

	return (
		<div ref={ resizeRef } className={ clsx( 'chart', { 'is-placeholder': isPlaceholder } ) }>
			<div className="chart__y-axis-markers">
				<div className="chart__y-axis-marker is-hundred" />
				<div className="chart__y-axis-marker is-fifty" />
				<div className="chart__y-axis-marker is-zero" />

				{ ( isPlaceholder || isEmptyChart ) && (
					<div className="chart__empty">
						{ children || (
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
						) }
					</div>
				) }
			</div>
			{ ! isPlaceholder && ! hideYAxis && <ChartYAxis /> }
			<BarContainer
				barClick={ barClick }
				chartWidth={ width }
				data={ chartData }
				isPlaceholder={ isPlaceholder }
				isRtl={ isRtl }
				isTouch={ hasTouch() }
				setTooltip={ handleTooltipChange }
				yAxisMax={ yMax }
				hideXAxis={ hideXAxis }
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

Chart.propTypes = {
	barClick: PropTypes.func,
	data: PropTypes.array,
	isPlaceholder: PropTypes.bool,
	isRtl: PropTypes.bool,
	minBarWidth: PropTypes.number,
	minTouchBarWidth: PropTypes.number,
	numberFormat: PropTypes.func,
	translate: PropTypes.func,
	chartXPadding: PropTypes.number,
	sliceFromBeginning: PropTypes.bool,
	minBarsToBeShown: PropTypes.number,
	hideYAxis: PropTypes.bool,
	hideXAxis: PropTypes.bool,
};

export default withRtl( localize( Chart ) );
