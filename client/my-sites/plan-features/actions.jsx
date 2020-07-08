/**
 * External dependencies
 */

import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get, noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isMonthly } from 'lib/plans/constants';
import { getPlanClass, planLevelsMatch } from 'lib/plans';
import { recordTracksEvent } from 'state/analytics/actions';

const PlanFeaturesActions = ( {
	availableForPurchase = true,
	canPurchase,
	className,
	currentSitePlanSlug,
	current = false,
	forceDisplayButton = false,
	freePlan = false,
	manageHref,
	isLandingPage,
	isPlaceholder = false,
	isPopular,
	isInSignup,
	isLaunchPage,
	onUpgradeClick = noop,
	planName,
	planType,
	primaryUpgrade = false,
	selectedPlan,
	recordTracksEvent: trackTracksEvent,
	translate,
	...props
} ) => {
	let upgradeButton;

	const classes = classNames(
		'plan-features__actions-button',
		{
			'is-current': current,
			'is-primary': selectedPlan
				? planLevelsMatch( selectedPlan, planType )
				: ( primaryUpgrade && ! isPlaceholder ) || isPopular,
		},
		className
	);

	if ( current && ! isInSignup ) {
		upgradeButton = (
			<Button className={ classes } href={ manageHref } disabled={ ! manageHref }>
				{ canPurchase ? translate( 'Manage plan' ) : translate( 'View plan' ) }
			</Button>
		);
	} else if ( availableForPurchase || isPlaceholder ) {
		let buttonText = freePlan
			? translate( 'Select Free', { context: 'button' } )
			: translate( 'Upgrade', { context: 'verb' } );
		if ( isLandingPage ) {
			buttonText = translate( 'Select', { context: 'button' } );
		}
		if ( isLaunchPage ) {
			if ( freePlan ) {
				buttonText = translate( 'Keep this plan', {
					comment:
						'A selection to keep the current plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
				} );
			} else {
				buttonText = translate( 'Select %(plan)s', {
					args: {
						plan: planName,
					},
					context: 'Button to select a paid plan by plan name, e.g., "Select Personal"',
					comment:
						'A button to select a new paid plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
				} );
			}
		} else if ( isInSignup ) {
			buttonText = translate( 'Start with %(plan)s', {
				args: {
					plan: planName,
				},
			} );
		}

		if (
			isMonthly( currentSitePlanSlug ) &&
			getPlanClass( planType ) === getPlanClass( currentSitePlanSlug )
		) {
			buttonText = translate( 'Upgrade to Yearly' );
		}

		const handleUpgradeButtonClick = () => {
			if ( isPlaceholder ) {
				return;
			}

			trackTracksEvent( 'calypso_plan_features_upgrade_click', {
				current_plan: currentSitePlanSlug,
				upgrading_to: planType,
			} );

			onUpgradeClick();
		};

		upgradeButton = (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ props.buttonText || buttonText }
			</Button>
		);
	} else if ( ! availableForPurchase && forceDisplayButton ) {
		upgradeButton = (
			<Button className={ classes } disabled={ true }>
				{ props.buttonText }
			</Button>
		);
	}

	return (
		<div className="plan-features__actions">
			<div className="plan-features__actions-buttons">{ upgradeButton }</div>
		</div>
	);
};

PlanFeaturesActions.propTypes = {
	availableForPurchase: PropTypes.bool,
	buttonText: PropTypes.string,
	canPurchase: PropTypes.bool.isRequired,
	className: PropTypes.string,
	current: PropTypes.bool,
	currentSitePlanSlug: PropTypes.string,
	forceDisplayButton: PropTypes.bool,
	freePlan: PropTypes.bool,
	isPlaceholder: PropTypes.bool,
	isLandingPage: PropTypes.bool,
	isLaunchPage: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	planType: PropTypes.string,
	primaryUpgrade: PropTypes.bool,
	selectedPlan: PropTypes.string,
};

export default connect(
	( state, { isInSignup } ) => {
		if ( isInSignup ) {
			return { currentSitePlanSlug: null };
		}

		const selectedSiteId = getSelectedSiteId( state );
		const currentSitePlan = getCurrentPlan( state, selectedSiteId );
		const currentSitePlanSlug = get( currentSitePlan, 'productSlug', null );
		return { currentSitePlanSlug };
	},
	{ recordTracksEvent }
)( localize( PlanFeaturesActions ) );
