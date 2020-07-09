/**
 * External dependencies
 */
import { noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackBundleCard from 'components/jetpack-bundle-card';

export default function JetpackBundleCardExample() {
	return (
		<div>
			<h3>Jetpack Bundle Card</h3>
			<JetpackBundleCard
				iconSlug="jetpack_anti_spam"
				productName="Security Bundle"
				subheadline="Get all of the essential security tools"
				description="Enjoy the peace of mind of complete site protection. This bundle includes everything you need to keep your site backed up, free of spam and one-step ahead of threats. Options available: Real-Time or Daily"
				originalPrice={ 30 }
				discountedPrice={ 25 }
				withStartingPrice
				billingTimeFrame="per month, billed yearly"
				badgeLabel="Best value"
				buttonLabel="Get the Security Bundle"
				onButtonClick={ noop }
				features="Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid quia, eum culpa maxime tempore soluta! Expedita, praesentium eaque nulla id placeat illo quibusdam rem nam ipsum. Labore nulla praesentium rerum?"
			/>
		</div>
	);
}

JetpackBundleCardExample.displayName = 'JetpackBundleCardExample';
