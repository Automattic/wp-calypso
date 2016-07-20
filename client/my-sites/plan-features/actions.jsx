/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import noop from 'lodash/noop';
import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Gridicon from 'components/gridicon';

const PlanFeaturesActions = ( {
	available = true,
	current = false,
	popular = false,
	freePlan = false,
	onUpgradeClick = noop,
	isPlaceholder = false,
	translate
} ) => {
	let upgradeButton;
	const className = classNames( {
		'plan-features__actions-button': true,
		'is-current': current,
		'is-primary': popular && ! isPlaceholder,
	} );

	if ( current ) {
		upgradeButton = (
			<Button className={ className } disabled>
				<Gridicon size={ 18 } icon="checkmark" />
				{ translate( 'Your plan' ) }
			</Button>
		);
	} else if ( available || isPlaceholder ) {
		upgradeButton = (
			<Button
				className={ className }
				onClick={ isPlaceholder ? noop : onUpgradeClick }
				disabled={ isPlaceholder }
			>
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
	popular: PropTypes.bool,
	current: PropTypes.bool,
	available: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	freePlan: PropTypes.bool,
	isPlaceholder: PropTypes.bool
};

export default localize( PlanFeaturesActions );
