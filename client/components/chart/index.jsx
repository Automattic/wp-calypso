/**
 * External dependencies
 */
import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { localize, withRtl } from 'i18n-calypso';
import { noop } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { hasTouch } from 'lib/touch-detect';
import { useWindowResizeCallback } from 'lib/track-element-size';
import Tooltip from 'components/tooltip';
import Notice from 'components/notice';
import BarContainer from './bar-container';

/**
 * Style dependencies
 */
import './style.scss';

const isTouch = hasTouch();

/**
 * Auxiliary method to calculate the maximum value for the Y axis, based on a dataset.
 *
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
	isPlaceholder,
	isRtl,
	minBarWidth,
	minTouchBarWidth,
	numberFormat,
	translate,
} ) {
	const [ tooltip, setTooltip ] = useState( { isTooltipVisible: false } );
	const [ sizing, setSizing ] = useState( { clientWidth: 650, hasResized: false } );

	const { hasResized } = sizing;

	// Callback to handle tooltip changes.
	// Needs to be memoized to avoid assigning children a new function every render.
	const handleTooltipChange = useCallback( ( tooltipContext, tooltipPosition, tooltipData ) => {
		if ( ! tooltipContext || ! tooltipPosition || ! tooltipData ) {
			setTooltip( { isTooltipVisible: false } );
		} else {
			setTooltip( { tooltipContext, tooltipPosition, tooltipData, isTooltipVisible: true } );
		}
	}, [] );

	// Callback to handle element size changes.
	// Needs to be memoized to avoid causing the `useWindowResizeCallback` custom hook to re-subscribe.
	const handleContentRectChange = useCallback( ( contentRect ) => {
		setSizing( ( prevSizing ) => {
			const clientWidth = contentRect.width - 82;

			if ( ! prevSizing.hasResized || clientWidth !== prevSizing.clientWidth ) {
				return { clientWidth, hasResized: true };
			}
			return prevSizing;
		} );
	}, [] );

	// Subscribe to changes to element size and position.
	const resizeRef = useWindowResizeCallback( handleContentRectChange );

	const minWidth = isTouch ? minTouchBarWidth : minBarWidth;
	const width = isTouch && sizing.clientWidth <= 0 ? 350 : sizing.clientWidth; // mobile safari bug with zero width
	const maxBars = Math.floor( width / minWidth );

	// Memoize data calculations to avoid performing them too often.
	const { chartData, isEmptyChart, yMax } = useMemo( () => {
		if ( ! hasResized ) {
			return {};
		}

		const nextData = data.length <= maxBars ? data : data.slice( 0 - maxBars );
		const nextVals = data.map( ( { value } ) => value );

		return {
			chartData: nextData,
			isEmptyChart: Boolean( nextVals.length && ! nextVals.some( ( a ) => a > 0 ) ),
			yMax: getYAxisMax( nextVals ),
		};
	}, [ data, maxBars, hasResized ] );

	// If we don't have any sizing info yet, render an empty chart with the ref.
	if ( ! hasResized ) {
		return <div ref={ resizeRef } className="chart" />;
	}

	// Otherwise, render full chart.
	const { isTooltipVisible, tooltipContext, tooltipPosition, tooltipData } = tooltip;

	return (
		<div ref={ resizeRef } className={ classNames( 'chart', { 'is-placeholder': isPlaceholder } ) }>
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
			{ ! isPlaceholder && (
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
			) }
			<BarContainer
				barClick={ barClick }
				chartWidth={ width }
				data={ chartData }
				isPlaceholder={ isPlaceholder }
				isRtl={ isRtl }
				isTouch={ hasTouch() }
				setTooltip={ handleTooltipChange }
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

Chart.propTypes = {
	barClick: PropTypes.func,
	data: PropTypes.array,
	isPlaceholder: PropTypes.bool,
	isRtl: PropTypes.bool,
	loading: PropTypes.bool,
	minBarWidth: PropTypes.number,
	minTouchBarWidth: PropTypes.number,
	numberFormat: PropTypes.func,
	translate: PropTypes.func,
};

Chart.defaultProps = {
	barClick: noop,
	isPlaceholder: false,
	minBarWidth: 15,
	minTouchBarWidth: 42,
};

export default withRtl( localize( Chart ) );
