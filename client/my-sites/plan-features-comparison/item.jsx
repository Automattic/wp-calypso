/**
 * External dependencies
 */
import React from 'react';
import Gridicon from 'calypso/components/gridicon';

export function PlanFeaturesAvailableItem( { children } ) {
	return (
		<div className="plan-features-comparison__item">
			<Gridicon className="plan-features-comparison__item-checkmark" size={ 18 } icon="checkmark" />
			{ children }
		</div>
	);
}

export function PlanFeaturesMissingItem( { children } ) {
	return (
		<div className="plan-features-comparison__item">
			<Gridicon className="plan-features-comparison__item-cross" size={ 18 } icon="cross" />
			{ children }
		</div>
	);
}
