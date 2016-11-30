/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { PLAN_BUSINESS, FEATURE_ADVANCED_SEO } from 'lib/plans/constants';
import UpgradeBanner from 'blocks/upgrade-banner';

const UpgradeBanners = () =>
	<div>
		<UpgradeBanner
			button
			description="Live chat support and no advertising."
			href="#"
			title="Upgrade to a Personal Plan!"
		/>
		<UpgradeBanner
			title="Upgrade to a Personal Plan!"
		/>
		<UpgradeBanner
			description="Live chat support and no advertising."
			href="#"
			title="Upgrade to a Personal Plan!"
		/>
		<UpgradeBanner
			callToAction="Upgrade for $9.99"
			description="Live chat support and no advertising."
			href="#"
			title="Upgrade to a Personal Plan!"
		/>
		<UpgradeBanner
			callToAction="Upgrade for $9.99"
			callToActionButton
			description="Live chat support and no advertising."
			href="#"
			title="Upgrade to a Personal Plan!"
		/>
		<UpgradeBanner
			feature={ FEATURE_ADVANCED_SEO }
			list={ [ 'Live chat support', 'No advertising' ] }
			plan={ PLAN_BUSINESS }
			title="Upgrade to a Personal Plan!"
		/>
		<UpgradeBanner
			color="#855DA6"
			description="Live chat support and no advertising."
			href="#"
			icon="trophy"
			title="Upgrade to a Personal Plan!"
		/>
	</div>;

export default UpgradeBanners;
