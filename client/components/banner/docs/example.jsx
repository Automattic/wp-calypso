/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import {
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_JETPACK_PERSONAL,
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
		<Banner href="#" plan={ PLAN_PREMIUM } title="Upgrade to a Premium Plan!" />
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
		<Banner
			href="#"
			plan={ PLAN_JETPACK_PERSONAL }
			title="Upgrade to a Jetpack Personal Plan!"
			jetpack={ true }
		/>
		<Banner
			callToAction="Get Backups"
			description="New plugins can lead to unexpected changes. Ensure you can restore your site if something goes wrong."
			dismissPreferenceName="devdocs-banner-backups-example"
			dismissTemporary
			horizontal
			href="#"
			jetpack
			title="Make sure your site is backed up before installing a new plugin."
		/>
	</div>
);

BannerExample.displayName = 'Banner';

export default BannerExample;
