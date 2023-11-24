import styled from '@emotion/styled';
import { TranslateResult } from 'i18n-calypso';
import { Dispatch, PropsWithChildren, SetStateAction, useRef } from 'react';
import Tooltip from 'calypso/components/tooltip';
import { hasTouch } from '../lib/touch-detect';

// TODO:
// The hover area container should ideally fit the dimensions of the child components
// However, it's not easy to find a configuration that fits all possible display,
// e.g. the feature copies in the plans table is an `inline` element, the downgrade button
// is a `inline-block` element having 100% width. Looking into @wordpress/tooltip, I think
// there is a way, but this intermediate solution seems to provide a less intrusive solution for the current needs.
const HoverAreaContainer = styled.div< { display?: 'block' | 'inline-block' } >`
	display: ${ ( { display = 'block' } ) => display };
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

export const Plans2023Tooltip = ( {
	showOnMobile = true,
	display = 'inline-block',
	...props
}: PropsWithChildren< {
	text?: TranslateResult;
	setActiveTooltipId: Dispatch< SetStateAction< string > >;
	activeTooltipId: string;
	id: string;
	showOnMobile?: boolean;
	display?: 'block' | 'inline-block';
} > ) => {
	const { activeTooltipId, setActiveTooltipId, id } = props;
	const tooltipRef = useRef< HTMLDivElement >( null );
	const isTouch = hasTouch();
	const isVisible = activeTooltipId === id;

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
				onMouseEnter={ () => ! isTouch && setActiveTooltipId( id ) }
				onMouseLeave={ () => ! isTouch && setActiveTooltipId( '' ) }
				onTouchStart={ () => isTouch && setActiveTooltipId( getMobileActiveTooltip() ) }
				id={ props.id }
				display={ display }
			>
				{ props.children }
			</HoverAreaContainer>
			<StyledTooltip
				isVisible={ isVisible }
				position="top"
				context={ tooltipRef.current }
				hideArrow
				showOnMobile={ showOnMobile }
			>
				{ props.text }
			</StyledTooltip>
		</>
	);
};
