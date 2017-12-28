/** @format */

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
} from 'client/lib/plans/constants';
import Banner from 'client/components/banner';

const BannerExample = () => (
	<div>
		<Banner disableHref title="Banner unrelated to any plan" />
		<Banner
			description="And with a description."
			disableHref
			icon="star"
			title="Banner unrelated to any plan"
		/>
		<Banner href="#" plan={ PLAN_PERSONAL } title="Upgrade to a Personal Plan!" />
		<Banner href="#" plan={ PLAN_PREMIUM } title="Upgrade to a Premium Plan!" />
		<Banner href="#" plan={ PLAN_BUSINESS } title="Upgrade to a Business Plan!" />
		<Banner
			callToAction="Upgrade for $9.99"
			feature={ FEATURE_ADVANCED_SEO }
			href="#"
			list={ [ 'Live chat support', 'No advertising' ] }
			plan={ PLAN_BUSINESS }
			price={ [ 10.99, 9.99 ] }
			title="Upgrade to a Business Plan!"
		/>
		<Banner
			callToAction="Upgrade for $9.99"
			description="Live chat support and no advertising."
			dismissPreferenceName="devdocs-banner-example"
			dismissTemporary
			list={ [ 'Live chat support', 'No advertising' ] }
			plan={ PLAN_BUSINESS }
			title="Upgrade to a Business Plan!"
		/>
	</div>
);

BannerExample.displayName = 'Banner';

export default BannerExample;
