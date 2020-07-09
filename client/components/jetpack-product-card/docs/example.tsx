/**
 * External dependencies
 */
import { noop } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackProductCard from 'components/jetpack-product-card';

export default function JetpackProductCardExample() {
	return (
		<div>
			<h3>Jetpack Product Card</h3>
			<JetpackProductCard
				iconSlug="jetpack_anti_spam"
				productName="Security Bundle"
				subheadline="Get all of the essential security tools"
				description="Enjoy the peace of mind of complete site protection. This bundle includes everything you need to keep your site backed up, free of spam and one-step ahead of threats. Options available: Real-Time or Daily"
				originalPrice={ 30 }
				billingTimeFrame="per month, billed yearly"
				buttonLabel="Get the Security Bundle"
				onButtonClick={ noop }
				features="Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid quia, eum culpa maxime tempore soluta! Expedita, praesentium eaque nulla id placeat illo quibusdam rem nam ipsum. Labore nulla praesentium rerum?"
			/>
			<br />
			<h3>Jetpack Product Card with Long Name and Subheadline</h3>
			<JetpackProductCard
				iconSlug="jetpack_anti_spam"
				productName="Security Bundle Security Bundle Security Bundle"
				subheadline="Get all of the essential security tools. Get all of the essential security tools. Get all of the essential security tools."
				description="Enjoy the peace of mind of complete site protection. This bundle includes everything you need to keep your site backed up, free of spam and one-step ahead of threats. Options available: Real-Time or Daily"
				originalPrice={ 30 }
				billingTimeFrame="per month, billed yearly"
				buttonLabel="Get the Security Bundle"
				onButtonClick={ noop }
				features="Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid quia, eum culpa maxime tempore soluta! Expedita, praesentium eaque nulla id placeat illo quibusdam rem nam ipsum. Labore nulla praesentium rerum?"
			/>
			<br />
			<h3>Jetpack Product Card with Product Type, Badge, Starting Price and Discount</h3>
			<JetpackProductCard
				iconSlug="jetpack_anti_spam"
				productName="Security Bundle"
				productType="Real-Time"
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
			<br />
			<h3>HIghlighted Jetpack Product Card</h3>
			<JetpackProductCard
				iconSlug="jetpack_anti_spam"
				productName="Security Bundle"
				subheadline="Get all of the essential security tools"
				description="Enjoy the peace of mind of complete site protection. This bundle includes everything you need to keep your site backed up, free of spam and one-step ahead of threats. Options available: Real-Time or Daily"
				originalPrice={ 30 }
				billingTimeFrame="per month, billed yearly"
				buttonLabel="Get the Security Bundle"
				onButtonClick={ noop }
				features="Lorem ipsum dolor sit amet consectetur adipisicing elit. Aliquid quia, eum culpa maxime tempore soluta! Expedita, praesentium eaque nulla id placeat illo quibusdam rem nam ipsum. Labore nulla praesentium rerum?"
				isHighlighted
			/>
		</div>
	);
}

JetpackProductCardExample.displayName = 'JetpackProductCardExample';
