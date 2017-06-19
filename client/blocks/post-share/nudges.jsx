/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Banner from 'components/banner';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import formatCurrency from 'lib/format-currency';

export const UpgradeToPremiumNudge = props => {
	const {
		businessDiscountedRawPrice,
		businessRawPrice,
		translate,
		userCurrency,
	} = props;

	return (
		<Banner
			className="post-share__actions-list-upgrade-nudge"
			callToAction={
				translate( 'Upgrade for %s', {
					args: formatCurrency( businessDiscountedRawPrice || businessRawPrice, userCurrency ),
					comment: '%s will be replaced by a formatted price, i.e $9.99'
				} )
			}
			list={ [
				translate( 'Schedule your social messages in advance.' ),
				translate( 'Remove all advertising from your site.' ),
				translate( 'Enjoy live chat support.' ),
				translate( 'Ability to add features through external plugins.' ),
				translate( 'Access to thousands of themes.' ),
			] }
			plan={ PLAN_BUSINESS }
			title={ translate( 'Upgrade to a Business Plan!' ) } />
	);
};
