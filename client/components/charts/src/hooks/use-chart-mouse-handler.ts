import { localPoint } from '@visx/event';
import { useTooltip } from '@visx/tooltip';
import { useCallback, type MouseEvent } from 'react';
import type { DataPoint } from '../components/shared/types';

type UseChartMouseHandlerProps = {
	/**
	 * Whether tooltips are enabled
	 */
	withTooltips: boolean;
};

type UseChartMouseHandlerReturn = {
	/**
	 * Handler for mouse move events
	 */
	onMouseMove: ( event: React.MouseEvent< SVGElement >, data: DataPoint ) => void;
	/**
	 * Handler for mouse leave events
	 */
	onMouseLeave: () => void;
	/**
	 * Whether the tooltip is currently open
	 */
	tooltipOpen: boolean;
	/**
	 * The current tooltip data
	 */
	tooltipData: DataPoint | null;
	/**
	 * The current tooltip left position
	 */
	tooltipLeft: number | undefined;
	/**
	 * The current tooltip top position
	 */
	tooltipTop: number | undefined;
};

/**
 * Hook to handle mouse interactions for chart components
 *
 * @param {UseChartMouseHandlerProps} props - Hook configuration
 * @return {UseChartMouseHandlerReturn} Object containing handlers and tooltip state
 */
const useChartMouseHandler = ( {
	withTooltips,
}: UseChartMouseHandlerProps ): UseChartMouseHandlerReturn => {
	const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
		useTooltip< DataPoint >();

	// TODO: either debounce/throttle or use useTooltipInPortal with built-in debounce
	const onMouseMove = useCallback(
		( event: MouseEvent< SVGElement >, data: DataPoint ) => {
			if ( ! withTooltips ) {
				return;
			}

			const coords = localPoint( event );
			if ( ! coords ) {
				return;
			}

			showTooltip( {
				tooltipData: data,
				tooltipLeft: coords.x,
				tooltipTop: coords.y - 10,
			} );
		},
		[ withTooltips, showTooltip ]
	);

	const onMouseLeave = useCallback( () => {
		if ( ! withTooltips ) {
			return;
		}
		hideTooltip();
	}, [ withTooltips, hideTooltip ] );

	return {
		onMouseMove,
		onMouseLeave,
		tooltipOpen,
		tooltipData,
		tooltipLeft,
		tooltipTop,
	};
};

export default useChartMouseHandler;
