/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import {
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	FEATURE_ADVANCED_SEO,
} from 'lib/plans/constants';
import Banner from 'components/banner';

const BannerExample = () =>
	<div>
		<Banner
			icon="info-outline"
			title="Banner unrelated to any plan"
		/>
		<Banner
			description="Live chat support and no advertising."
			href="#"
			plan={ PLAN_PERSONAL }
			title="Upgrade to a Personal Plan!"
		/>
		<Banner
			description="Live chat support and no advertising."
			href="#"
			icon="trophy"
			plan={ PLAN_PREMIUM }
			title="Upgrade to a Premium Plan!"
		/>
		<Banner
			callToAction="Upgrade for $9.99"
			feature={ FEATURE_ADVANCED_SEO }
			list={ [ 'Live chat support', 'No advertising' ] }
			plan={ PLAN_BUSINESS }
			price={ [ 10.99, 9.99 ] }
			title="Upgrade to a Business Plan!"
		/>
	</div>;

export default BannerExample;
