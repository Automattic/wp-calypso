/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'calypso/components/gridicon';
import classNames from 'classnames';

export function PlanFeaturesItem( props ) {
	const itemInfoClasses = classNames( 'plan-features-comparison__item-info-container', {
		'plan-features-comparison__item-info-annual-only': props.annualOnlyContent,
	} );
	const icon = props.isFeatureAvailable ? 'checkmark' : 'cross';
	const gridIconClasses = classNames( {
		'plan-features-comparison__item-checkmark': props.isFeatureAvailable,
		'plan-features-comparison__item-cross': ! props.isFeatureAvailable,
	} );
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
			</div>
		</div>
	);
}
