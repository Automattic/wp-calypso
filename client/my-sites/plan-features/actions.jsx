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

const PlanFeaturesActions = ( {
	canPurchase,
	className,
	available = true,
	current = false,
	primaryUpgrade = false,
	freePlan = false,
	onUpgradeClick = noop,
	isPlaceholder = false,
	isPopular,
	isInSignup,
	translate,
	manageHref,
	isLandingPage,
	planName
} ) => {
	let upgradeButton;
	const classes = classNames(
		'plan-features__actions-button',
		{
			'is-current': current,
			'is-primary': ( primaryUpgrade && ! isPlaceholder ) || ( isPopular )
		},
		className
	);

	if ( current && ! isInSignup ) {
		upgradeButton = (
			<Button className={ classes } href={ manageHref } disabled={ ! manageHref }>
				{ canPurchase ? translate( 'Manage Plan' ) : translate( 'View Plan' ) }
			</Button>
		);
	} else if ( available || isPlaceholder ) {
		let buttonText = freePlan
			? translate( 'Select Free', { context: 'button' } )
			: translate( 'Upgrade', { context: 'verb' } );
		if ( isLandingPage ) {
			buttonText = translate( 'Select', { context: 'button' } );
		}
		if ( isInSignup ) {
			buttonText = translate( 'Start with %(plan)s', {
				args: {
					plan: planName
				}
			} );
		}

		upgradeButton = (
			<Button
				className={ classes }
				onClick={ isPlaceholder ? noop : onUpgradeClick }
				disabled={ isPlaceholder }
			>
				{ buttonText }
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
	canPurchase: PropTypes.bool.isRequired,
	className: PropTypes.string,
	primaryUpgrade: PropTypes.bool,
	current: PropTypes.bool,
	available: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	freePlan: PropTypes.bool,
	isPlaceholder: PropTypes.bool,
	isLandingPage: PropTypes.bool
};

export default localize( PlanFeaturesActions );
