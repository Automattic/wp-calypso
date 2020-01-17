/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import {
	PLAN_BLOGGER,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_BUSINESS,
	FEATURE_ADVANCED_SEO,
} from 'lib/plans/constants';
import Banner from 'components/banner';

const BannerExample = () => (
	<div>
		<Banner disableHref title="Banner unrelated to any plan" />
		<Banner
			description="And with a description."
			disableHref
			icon="star"
			title="Banner unrelated to any plan"
		/>
		<Banner showIcon={ false } title="Banner with showIcon set to false" />
		<Banner href="#" plan={ PLAN_BLOGGER } title="Upgrade to a Blogger Plan!" />
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
		<Banner href="#" plan={ PLAN_ECOMMERCE } title="Upgrade to an eCommerce Plan!" />

		<Banner href="#" plan={ PLAN_JETPACK_PERSONAL } title="Upgrade to a Jetpack Personal Plan!" />
		<Banner href="#" plan={ PLAN_JETPACK_PREMIUM } title="Upgrade to a Jetpack Premium Plan!" />
		<Banner href="#" plan={ PLAN_JETPACK_BUSINESS } title="Upgrade to a Jetpack Business Plan!" />
		<Banner
			callToAction="Get Backups"
			description="New plugins can lead to unexpected changes. Ensure you can restore your site if something goes wrong."
			dismissPreferenceName="devdocs-banner-backups-example"
			dismissTemporary={ true }
			horizontal={ true }
			href="#"
			jetpack={ true }
			title="Make sure your site is backed up before installing a new plugin."
		/>
	</div>
);

BannerExample.displayName = 'Banner';

export default BannerExample;
