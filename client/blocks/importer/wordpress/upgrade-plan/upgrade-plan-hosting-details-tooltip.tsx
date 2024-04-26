import { Tooltip } from '@automattic/components';
import { TranslateResult } from 'i18n-calypso';
import { Dispatch, PropsWithChildren, SetStateAction, useRef } from 'react';
import { hasTouch } from 'calypso/lib/touch-detect';

export const UpgradePlanHostingDetailsTooltip = ( {
	showOnMobile = true,
	...props
}: PropsWithChildren< {
	setActiveTooltipId: Dispatch< SetStateAction< string > >;
	activeTooltipId: string;
	id: string;
	showOnMobile?: boolean;
	hideArrow?: boolean;
	customerName: string;
	customerTestimonial: TranslateResult;
	customerInfo?: TranslateResult;
} > ) => {
	const { activeTooltipId, setActiveTooltipId, id } = props;
	const tooltipRef = useRef< HTMLDivElement >( null );
	const isTouch = hasTouch();

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
			<div
				className="import__upgrade-plan-hosting-details-tooltip-hover-area-container"
				ref={ tooltipRef }
				onMouseEnter={ () => ! isTouch && setActiveTooltipId( id ) }
				onMouseLeave={ () => ! isTouch && setActiveTooltipId( '' ) }
				onTouchStart={ () => isTouch && setActiveTooltipId( getMobileActiveTooltip() ) }
				id={ props.id }
			>
				{ props.children }
			</div>
			<Tooltip
				className="import__upgrade-plan-hosting-details-tooltip"
				isVisible={ isVisible }
				position="top"
				context={ tooltipRef.current }
				hideArrow={ props.hideArrow }
				showOnMobile={ showOnMobile }
			>
				<div>
					<div className="import__upgrade-plan-hosting-details-tooltip-user-text">
						{ props.customerTestimonial }
					</div>
					<strong className="import__upgrade-plan-hosting-details-tooltip-user-name">
						{ props.customerName }
					</strong>
					{ props.customerInfo && (
						<p className="import__upgrade-plan-hosting-details-tooltip-user-info">
							{ props.customerInfo }
						</p>
					) }
				</div>
			</Tooltip>
		</>
	);
};
