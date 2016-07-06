/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import noop from 'lodash/noop';
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'components/gridicon';

const PlanFeaturesActions = ( {
	available = true,
	current = false,
	freePlan = false,
	onUpgradeClick = noop,
	translate
} ) => {
	let upgradeButton;

	if ( current ) {
		upgradeButton = (
			<Button className="plan-features__actions-button is-current" disabled>
				<Gridicon size={ 18 } icon="checkmark" />
				{ translate( 'Your plan' ) }
			</Button>
		);
	} else if ( available ) {
		upgradeButton = (
			<Button className="plan-features__actions-button" onClick={ onUpgradeClick } primary>
				{
					freePlan
						? translate( 'Select Free' )
						: translate( 'Upgrade' )
				}
			</Button>
		);
	}

	return (
		<div className="plan-features__actions">
			<div className="plan-features__actions-buttons">
				{ upgradeButton }
			</div>
		</div>
	);
};

PlanFeaturesActions.propTypes = {
	current: PropTypes.bool,
	available: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	freePlan: PropTypes.bool
};

export default localize( PlanFeaturesActions );
