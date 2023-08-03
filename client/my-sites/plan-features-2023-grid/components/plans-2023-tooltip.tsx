import { useDesktopBreakpoint } from '@automattic/viewport-react';
import styled from '@emotion/styled';
import { TranslateResult } from 'i18n-calypso';
import { Dispatch, PropsWithChildren, SetStateAction, useEffect, useRef, useState } from 'react';
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

export const Plans2023Tooltip = (
	props: PropsWithChildren< {
		text?: TranslateResult;
		setActiveTooltipId: Dispatch< SetStateAction< string > >;
		activeTooltipId: string;
		id: string;
	} >
) => {
	const [ isVisible, setIsVisible ] = useState( false );
	const { activeTooltipId, setActiveTooltipId, id } = props;
	const tooltipRef = useRef< HTMLDivElement >( null );
	const isDesktop = useDesktopBreakpoint();

	useEffect( () => {
		activeTooltipId === id ? setIsVisible( true ) : setIsVisible( false );
	}, [ activeTooltipId, id ] );

	if ( ! props.text ) {
		return <>{ props.children }</>;
	}

	const getMobileActiveTooltip = () => {
		// Close tooltip if the user clicks on an open tooltip.
		if ( activeTooltipId === id ) {
			return '';
		}

		return id;
	};

	return (
		<>
			<HoverAreaContainer
				className="plans-2023-tooltip__hover-area-container"
				ref={ tooltipRef }
				onMouseEnter={ () => isDesktop && setActiveTooltipId( id ) }
				onMouseLeave={ () => isDesktop && setActiveTooltipId( '' ) }
				onTouchStart={ () => ! isDesktop && setActiveTooltipId( getMobileActiveTooltip() ) }
				id={ props.id }
			>
				{ props.children }
			</HoverAreaContainer>
			<StyledTooltip
				isVisible={ isVisible }
				position="top"
				context={ tooltipRef.current }
				hideArrow
				showOnMobile
			>
				{ props.text }
			</StyledTooltip>
		</>
	);
};
