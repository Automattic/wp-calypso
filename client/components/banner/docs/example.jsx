/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { PLAN_BUSINESS, FEATURE_ADVANCED_SEO } from 'lib/plans/constants';
import Banner from 'components/banner';

const BannerExample = () =>
	<div>
		<Banner
			title="Upgrade to a Personal Plan!"
		/>
		<Banner
			description="Live chat support and no advertising."
			href="#"
			title="Upgrade to a Personal Plan!"
		/>
		<Banner
			callToAction="Upgrade for $9.99"
			description="Live chat support and no advertising."
			href="#"
			title="Upgrade to a Personal Plan!"
		/>
		<Banner
			feature={ FEATURE_ADVANCED_SEO }
			list={ [ 'Live chat support', 'No advertising' ] }
			plan={ PLAN_BUSINESS }
			title="Upgrade to a Personal Plan!"
		/>
		<Banner
			color="#855DA6"
			description="Live chat support and no advertising."
			href="#"
			icon="trophy"
			title="Upgrade to a Personal Plan!"
		/>
	</div>;

export default BannerExample;
