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

const PlanFeaturesFooter = ( { translate, current = false, available = true, description, onUpgradeClick = noop } ) => {
	let upgradeButton;

	if ( current ) {
		upgradeButton = (
			<Button className="plan-features__footer-button is-current" disabled>
				<Gridicon size={ 18 } icon="checkmark" />
				{ translate( 'Your plan' ) }
			</Button>
		);
	} else if ( available ) {
		upgradeButton = (
			<Button className="plan-features__footer-button" onClick={ onUpgradeClick } primary>
				{ translate( 'Upgrade' ) }
			</Button>
		);
	}

	return (
		<footer className="plan-features__footer">
			<p className="plan-features__footer-desc">{ description }</p>
			<div className="plan-features__footer-buttons">
				{ upgradeButton }
			</div>
		</footer>
	);
};

PlanFeaturesFooter.propTypes = {
	current: PropTypes.bool,
	available: PropTypes.bool,
	description: PropTypes.string.isRequired,
	onUpgradeClick: PropTypes.func
};

export default localize( PlanFeaturesFooter );
