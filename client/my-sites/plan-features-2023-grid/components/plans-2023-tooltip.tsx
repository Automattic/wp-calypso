import styled from '@emotion/styled';
import { TranslateResult } from 'i18n-calypso';
import { PropsWithChildren, useRef, useState } from 'react';
import Tooltip from 'calypso/components/tooltip';

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

export const Plans2023Tooltip = ( props: PropsWithChildren< { text?: TranslateResult } > ) => {
	const [ isVisible, setIsVisible ] = useState( false );
	const tooltipRef = useRef< HTMLDivElement >( null );

	if ( ! props.text ) {
		return <>{ props.children }</>;
	}

	return (
		<>
			<HoverAreaContainer
				className="plans-2023-tooltip__hover-area-container"
				ref={ tooltipRef }
				onMouseEnter={ () => setIsVisible( true ) }
				onMouseLeave={ () => setIsVisible( false ) }
			>
				{ props.children }
			</HoverAreaContainer>
			<StyledTooltip
				isVisible={ isVisible }
				position="top"
				context={ tooltipRef.current }
				hideArrow
			>
				{ props.text }
			</StyledTooltip>
		</>
	);
};
