import { Tooltip } from '@automattic/components';
import styled from '@emotion/styled';
import { TranslateResult } from 'i18n-calypso';
import { Dispatch, PropsWithChildren, SetStateAction, useRef } from 'react';
import { hasTouch } from '../lib/touch-detect';

const HoverAreaContainer = styled.span`
	max-width: 220px;
`;

const StyledTooltip = styled( Tooltip )`
	&.tooltip.popover .popover__inner {
		background: var( --color-masterbar-background );
		text-align: start;
		border-radius: 4px;
		min-height: 32px;
		width: 210px;
		align-items: center;
		font-style: normal;
		font-weight: 400;
		font-size: 1em;
		padding: 8px 10px;
		top: -8px;
		overflow-wrap: break-word;
	}
`;

export type Plans2023TooltipProps = PropsWithChildren< {
	text?: TranslateResult;
	setActiveTooltipId: Dispatch< SetStateAction< string > >;
	activeTooltipId: string;
	id: string;
	showOnMobile?: boolean;
} >;

export const Plans2023Tooltip = ( {
	showOnMobile = true,
	activeTooltipId,
	setActiveTooltipId,
	id,
	text,
	children,
}: Plans2023TooltipProps ) => {
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
			<HoverAreaContainer
				className="plans-2023-tooltip__hover-area-container"
				ref={ tooltipRef }
				onMouseEnter={ () => ! isTouch && setActiveTooltipId( id ) }
				onMouseLeave={ () => ! isTouch && setActiveTooltipId( '' ) }
				onTouchStart={ () => isTouch && setActiveTooltipId( getMobileActiveTooltip() ) }
				id={ id }
			>
				{ children }
			</HoverAreaContainer>
			<StyledTooltip
				isVisible={ isVisible }
				position="top"
				context={ tooltipRef.current }
				hideArrow
				showOnMobile={ showOnMobile }
			>
				{ text }
			</StyledTooltip>
		</>
	);
};
