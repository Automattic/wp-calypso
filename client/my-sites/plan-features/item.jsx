/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

export default function PlanFeaturesItem( { children } ) {
	return (
		<li className="plan-features__item">
			<Gridicon className="plan-features__item-checkmark" size={ 18 } icon="checkmark" />
			{ children }
		</li>
	);
}
