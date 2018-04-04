/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { getSitePlan } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import { TYPE_PREMIUM, TERM_ANNUALLY } from 'lib/plans/constants';
import { findFirstSimilarPlanKey } from 'lib/plans';
import formatCurrency from 'lib/format-currency';

export const UpgradeToPremiumNudgePure = props => {
	const {
		premiumPrice,
		jetpackPremiumPrice,
		currentPlanSlug,
		translate,
		userCurrency,
		isJetpack,
	} = props;

	let price, featureList, proposedPlan;
	if ( isJetpack ) {
		price = jetpackPremiumPrice;
		featureList = [
			translate( 'Schedule your social messages in advance.' ),
			translate( 'Easy monetization options' ),
			translate( 'VideoPress support' ),
			translate( 'Daily Malware Scanning' ),
		];
		proposedPlan = findFirstSimilarPlanKey( currentPlanSlug, {
			type: TYPE_PREMIUM,
			term: TERM_ANNUALLY,
		} );
	} else {
		price = premiumPrice;
		featureList = [
			translate( 'Schedule your social messages in advance.' ),
			translate( 'Remove all advertising from your site.' ),
			translate( 'Enjoy live chat support.' ),
			translate( 'Easy monetization options' ),
			translate( 'Unlimited premium themes.' ),
		];
		proposedPlan = findFirstSimilarPlanKey( currentPlanSlug, { type: TYPE_PREMIUM } );
	}

	return (
		<Banner
			className="post-share__actions-list-upgrade-nudge"
			callToAction={ translate( 'Upgrade for %s', {
				args: formatCurrency( price, userCurrency ),
				comment: '%s will be replaced by a formatted price, i.e $9.99',
			} ) }
			list={ featureList }
			plan={ proposedPlan }
			title={ translate( 'Upgrade to a Premium Plan!' ) }
		/>
	);
};

export const UpgradeToPremiumNudge = connect( state => ( {
	currentPlanSlug: getSitePlan( state, getSelectedSiteId( state ) ),
} ) )( UpgradeToPremiumNudgePure );
