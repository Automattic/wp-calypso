/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import UpsellNudge from 'blocks/upsell-nudge';
import { TYPE_PREMIUM, TERM_ANNUALLY } from 'lib/plans/constants';
import { findFirstSimilarPlanKey } from 'lib/plans';
import canCurrentUser from 'state/selectors/can-current-user';
import { getSitePlan } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePlanRawPrice, getPlanDiscountedRawPrice } from 'state/sites/plans/selectors';

export const UpgradeToPremiumNudgePure = ( props ) => {
	const { price, planSlug, translate, userCurrency, canUserUpgrade, isJetpack } = props;

	let featureList;
	if ( isJetpack ) {
		featureList = [
			translate( 'Schedule your social messages in advance.' ),
			translate( 'Easy monetization options' ),
			translate( 'VideoPress support' ),
			translate( 'Daily Malware Scanning' ),
		];
	} else {
		featureList = [
			translate( 'Schedule your social messages in advance.' ),
			translate( 'Remove all advertising from your site.' ),
			translate( 'Enjoy live chat support.' ),
			translate( 'Easy monetization options' ),
			translate( 'Unlimited premium themes.' ),
		];
	}

	if ( ! canUserUpgrade ) {
		return null;
	}

	return (
		<UpsellNudge
			className="post-share__actions-list-upgrade-nudge"
			callToAction={ translate( 'Upgrade for %s', {
				args: formatCurrency( price, userCurrency ),
				comment: '%s will be replaced by a formatted price, i.e $9.99',
			} ) }
			forceDisplay
			list={ featureList }
			plan={ planSlug }
			showIcon
			title={ translate( 'Upgrade to a Premium Plan!' ) }
		/>
	);
};

const getDiscountedOrRegularPrice = ( state, siteId, plan ) =>
	getPlanDiscountedRawPrice( state, siteId, plan, { isMonthly: true } ) ||
	getSitePlanRawPrice( state, siteId, plan, { isMonthly: true } );

export const UpgradeToPremiumNudge = connect( ( state, ownProps ) => {
	const { isJetpack, siteId } = ownProps;
	const currentPlanSlug = ( getSitePlan( state, getSelectedSiteId( state ) ) || {} ).product_slug;
	const proposedPlan = findFirstSimilarPlanKey( currentPlanSlug, {
		type: TYPE_PREMIUM,
		...( isJetpack ? { term: TERM_ANNUALLY } : {} ),
	} );

	return {
		planSlug: proposedPlan,
		price: getDiscountedOrRegularPrice( state, siteId, proposedPlan ),
		canUserUpgrade: canCurrentUser( state, siteId, 'manage_options' ),
	};
} )( UpgradeToPremiumNudgePure );
