import { Gridicon } from '@automattic/components';
import classNames from 'classnames';

export function PlanFeaturesItem( props ) {
	const itemInfoClasses = classNames( 'plan-features-2023-grid__item-info-container', {
		'plan-features-2023-grid__item-info-annual-only': props.annualOnlyContent,
	} );
	const icon = props.isFeatureAvailable ? 'checkmark' : 'cross';
	const gridIconClasses = classNames( {
		'plan-features-2023-grid__item-checkmark': props.isFeatureAvailable,
		'plan-features-2023-grid__item-cross': ! props.isFeatureAvailable,
	} );

	return (
		<div className="plan-features-2023-grid__item plan-features-2023-grid__item-available">
			{ props.annualOnlyContent && (
				<div className="plan-features-2023-grid__item-annual-plan-container">
					{ props.annualOnlyContent }
				</div>
			) }
			<div className={ itemInfoClasses }>
				<Gridicon className={ gridIconClasses } size={ 18 } icon={ icon } />
				{ props.children }
			</div>
		</div>
	);
}
