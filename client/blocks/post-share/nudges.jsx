/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import { PLAN_PREMIUM, PLAN_JETPACK_PREMIUM } from 'lib/plans/constants';
import formatCurrency from 'lib/format-currency';

export const UpgradeToPremiumNudge = props => {
	const {
		premiumPrice,
		jetpackPremiumPrice,
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
		proposedPlan = PLAN_JETPACK_PREMIUM;
	} else {
		price = premiumPrice;
		featureList = [
			translate( 'Schedule your social messages in advance.' ),
			translate( 'Remove all advertising from your site.' ),
			translate( 'Enjoy live chat support.' ),
			translate( 'Easy monetization options' ),
			translate( 'Unlimited premium themes.' ),
		];
		proposedPlan = PLAN_PREMIUM;
	}

	return (
		<Banner
			className="post-share__actions-list-upgrade-nudge"
			callToAction={
				translate( 'Upgrade for %s', {
					args: formatCurrency( price, userCurrency ),
					comment: '%s will be replaced by a formatted price, i.e $9.99'
				} )
			}
			list={ featureList }
			plan={ proposedPlan }
			title={ translate( 'Upgrade to a Premium Plan!' ) } />
	);
};

export const UpgradeToPersonalNudge = props => {
	const { translate, isJetpack } = props;

	let description;
	if ( isJetpack ) {
		description = translate( 'Get spam protection, unlimited backup storage and more.' );
	} else {
		description = translate( 'Get unlimited premium themes, video uploads, monetize your site and more.' );
	}
	return (
		<Banner
			className="post-share__upgrade-nudge"
			feature="republicize"
			title={ translate( 'Unlock the ability to re-share posts to social media' ) }
			callToAction={ translate( 'Upgrade to Personal' ) }
			description={ description }
		/>
	);
};

