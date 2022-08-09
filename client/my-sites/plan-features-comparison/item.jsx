import { Gridicon } from '@automattic/components';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import InfoPopover from 'calypso/components/info-popover';

export function PlanFeaturesItem( props ) {
	const itemInfoClasses = classNames( 'plan-features-comparison__item-info-container', {
		'plan-features-comparison__item-info-annual-only': props.annualOnlyContent,
	} );
	const icon = props.isFeatureAvailable ? 'checkmark' : 'cross';
	const gridIconClasses = classNames( {
		'plan-features-comparison__item-checkmark': props.isFeatureAvailable,
		'plan-features-comparison__item-cross': ! props.isFeatureAvailable,
	} );
	const isMobile = useMobileBreakpoint();

	return (
		<div className="plan-features-comparison__item plan-features-comparison__item-available">
			{ props.annualOnlyContent && (
				<div className="plan-features-comparison__item-annual-plan-container">
					{ props.annualOnlyContent }
				</div>
			) }
			<div className={ itemInfoClasses }>
				<Gridicon className={ gridIconClasses } size={ 18 } icon={ icon } />
				{ props.children }
				{ props.hideInfoPopover ? null : (
					<InfoPopover
						className="plan-features-comparison__item-tip-info plan-features__item-tip-info"
						position={ isMobile ? 'left' : 'right' }
					>
						{ props.description }
					</InfoPopover>
				) }
			</div>
		</div>
	);
}
