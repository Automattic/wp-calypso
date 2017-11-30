/** @format */

/**
 * External dependencies
 */

import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getPlanClass, isMonthly } from 'lib/plans/constants';
import { recordTracksEvent } from 'state/analytics/actions';

const PlanFeaturesActions = ( {
	available = true,
	canPurchase,
	className,
	currentSitePlan,
	current = false,
	freePlan = false,
	manageHref,
	isLandingPage,
	isPlaceholder = false,
	isPopular,
	isInSignup,
	onUpgradeClick = noop,
	planName,
	planType,
	primaryUpgrade = false,
	selectedPlan,
	recordTracksEvent: trackTracksEvent,
	translate,
} ) => {
	let upgradeButton;
	const classes = selectedPlan
		? classNames(
				'plan-features__actions-button',
				{
					'is-current': current,
					'is-primary': planName === selectedPlan,
				},
				className
			)
		: classNames(
				'plan-features__actions-button',
				{
					'is-current': current,
					'is-primary': ( primaryUpgrade && ! isPlaceholder ) || isPopular,
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
					plan: planName,
				},
			} );
		}
		const isCurrentPlanMonthly = currentSitePlan && isMonthly( currentSitePlan.productSlug );
		if (
			isCurrentPlanMonthly &&
			getPlanClass( planType ) === getPlanClass( currentSitePlan.productSlug )
		) {
			buttonText = translate( 'Upgrade to Yearly' );
		}

		const handleUpgradeButtonClick = () => {
			if ( isPlaceholder ) {
				return noop();
			}

			trackTracksEvent( 'calypso_plan_features_upgrade_click', {
				current_plan: currentSitePlan && currentSitePlan.productSlug,
				upgrading_to: planType,
			} );

			onUpgradeClick();
		};

		upgradeButton = (
			<Button className={ classes } onClick={ handleUpgradeButtonClick } disabled={ isPlaceholder }>
				{ buttonText }
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
	available: PropTypes.bool,
	canPurchase: PropTypes.bool.isRequired,
	className: PropTypes.string,
	current: PropTypes.bool,
	freePlan: PropTypes.bool,
	isPlaceholder: PropTypes.bool,
	isLandingPage: PropTypes.bool,
	onUpgradeClick: PropTypes.func,
	planType: PropTypes.string,
	primaryUpgrade: PropTypes.bool,
	selectedPlan: PropTypes.string,
};

export default connect(
	( state, ownProps ) => {
		const { isInSignup } = ownProps;
		const selectedSiteId = isInSignup ? null : getSelectedSiteId( state );
		const currentSitePlan = getCurrentPlan( state, selectedSiteId );
		return {
			currentSitePlan,
		};
	},
	{
		recordTracksEvent,
	}
)( localize( PlanFeaturesActions ) );
