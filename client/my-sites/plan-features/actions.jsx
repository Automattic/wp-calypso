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
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isMonthly } from 'calypso/lib/plans/constants';
import { getPlanClass, planLevelsMatch } from 'calypso/lib/plans';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const PlanFeaturesActions = ( props ) => {
	return (
		<div className="plan-features__actions">
			<div className="plan-features__actions-buttons">
				<PlanFeaturesActionsButton { ...props } />
			</div>
		</div>
	);
};

const PlanFeaturesActionsButton = ( {
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

	if ( current && ! isInSignup ) {
		return (
			<Button className={ classes } href={ manageHref } disabled={ ! manageHref }>
				{ canPurchase ? translate( 'Manage plan' ) : translate( 'View plan' ) }
			</Button>
		);
	}

	if (
		( availableForPurchase || isPlaceholder ) &&
		isMonthly( currentSitePlanSlug ) &&
		getPlanClass( planType ) === getPlanClass( currentSitePlanSlug )
	) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ props.buttonText || translate( 'Upgrade to Yearly' ) }
			</Button>
		);
	}

	if ( ( availableForPurchase || isPlaceholder ) && ! isLaunchPage && isInSignup ) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ props.buttonText ||
					translate( 'Start with %(plan)s', {
						args: {
							plan: planName,
						},
					} ) }
			</Button>
		);
	}

	if ( ( availableForPurchase || isPlaceholder ) && isLaunchPage && ! freePlan ) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ props.buttonText ||
					translate( 'Select %(plan)s', {
						args: {
							plan: planName,
						},
						context: 'Button to select a paid plan by plan name, e.g., "Select Personal"',
						comment:
							'A button to select a new paid plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
					} ) }
			</Button>
		);
	}

	if ( ( availableForPurchase || isPlaceholder ) && isLaunchPage && freePlan ) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ props.buttonText ||
					translate( 'Keep this plan', {
						comment:
							'A selection to keep the current plan. Check screenshot - https://cloudup.com/cb_9FMG_R01',
					} ) }
			</Button>
		);
	}

	if ( ( availableForPurchase || isPlaceholder ) && isLandingPage ) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ props.buttonText || translate( 'Select', { context: 'button' } ) }
			</Button>
		);
	}

	if ( availableForPurchase || isPlaceholder ) {
		return (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ props.buttonText || freePlan
					? translate( 'Select Free', { context: 'button' } )
					: translate( 'Upgrade', { context: 'verb' } ) }
			</Button>
		);
	}

	if ( ! availableForPurchase && forceDisplayButton ) {
		return (
			<Button className={ classes } disabled={ true }>
				{ props.buttonText }
			</Button>
		);
	}

	return null;
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
