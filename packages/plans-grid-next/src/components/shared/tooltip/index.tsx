import { Tooltip as CoreTooltip } from '@automattic/components';
import { TranslateResult } from 'i18n-calypso';
import { Dispatch, PropsWithChildren, SetStateAction, useRef } from 'react';
import { hasTouch } from '../../../lib/touch-detect';
import './style.scss';

export type TooltipProps = PropsWithChildren< {
	text?: TranslateResult;
	setActiveTooltipId: Dispatch< SetStateAction< string > >;
	activeTooltipId: string;
	id: string;
	showOnMobile?: boolean;
} >;

const Tooltip = ( {
	showOnMobile = true,
	activeTooltipId,
	setActiveTooltipId,
	id,
	text,
	children,
}: TooltipProps ) => {
	const tooltipRef = useRef< HTMLDivElement >( null );
	const isTouch = hasTouch();

	if ( ! text ) {
		return <>{ children }</>;
	}

	const getMobileActiveTooltip = () => {
		// Close tooltip if the user clicks on an open tooltip.
		if ( activeTooltipId === id ) {
			return '';
		}

		return id;
	};

	const isVisible = activeTooltipId === id;

	return (
		<>
			<span
				className="plans-grid-next-tooltip__hover-area-container"
				ref={ tooltipRef }
				onMouseEnter={ () => ! isTouch && setActiveTooltipId( id ) }
				onMouseLeave={ () => ! isTouch && setActiveTooltipId( '' ) }
				onTouchStart={ () => isTouch && setActiveTooltipId( getMobileActiveTooltip() ) }
				id={ id }
			>
				{ children }
			</span>
			<CoreTooltip
				className="plans-grid-next-tooltip"
				isVisible={ isVisible }
				position="top"
				context={ tooltipRef.current }
				hideArrow
				showOnMobile={ showOnMobile }
			>
				{ text }
			</CoreTooltip>
		</>
	);
};

export default Tooltip;
