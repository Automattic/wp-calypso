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
	className,
	available = true,
	current = false,
	popular = false,
	freePlan = false,
	onUpgradeClick = noop,
	isPlaceholder = false,
	isInSignup,
	translate
} ) => {
	let upgradeButton;
	const classes = classNames(
		'plan-features__actions-button',
		{
			'is-current': current,
			'is-primary': popular && ! isPlaceholder
		},
		className
	);

	if ( current && ! isInSignup ) {
		upgradeButton = (
			<Button className={ classes } disabled>
				<Gridicon size={ 18 } icon="checkmark" />
				{ translate( 'Your plan' ) }
			</Button>
		);
	} else if ( available || isPlaceholder ) {
		upgradeButton = (
			<Button
				className={ classes }
				onClick={ isPlaceholder ? noop : onUpgradeClick }
				disabled={ isPlaceholder }
			>
				{
					freePlan
						? translate( 'Select Free', { context: 'button' } )
						: translate( 'Upgrade', { context: 'verb' } )
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
	className: PropTypes.string,
	popular: PropTypes.bool,
	current: PropTypes.bool,
	available: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	freePlan: PropTypes.bool,
	isPlaceholder: PropTypes.bool
};

export default localize( PlanFeaturesActions );
