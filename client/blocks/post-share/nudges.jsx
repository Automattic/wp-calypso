/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import { TYPE_PREMIUM, TERM_ANNUALLY } from 'lib/plans/constants';
import { findFirstSimilarPlanKey } from 'lib/plans';
import formatCurrency from 'lib/format-currency';
import { getSitePlan } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSitePlanRawPrice, getPlanDiscountedRawPrice } from 'state/sites/plans/selectors';

export const UpgradeToPremiumNudgePure = props => {
	const { price, planSlug, translate, userCurrency, isJetpack } = props;

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

	return (
		<Banner
			className="post-share__actions-list-upgrade-nudge"
			callToAction={ translate( 'Upgrade for %s', {
				args: formatCurrency( price, userCurrency ),
				comment: '%s will be replaced by a formatted price, i.e $9.99',
			} ) }
			list={ featureList }
			plan={ planSlug }
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
	};
} )( UpgradeToPremiumNudgePure );
