/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackProductSlideOutCard from 'calypso/components/jetpack/card/jetpack-product-slide-out-card';

/**
 * Style dependencies
 */
import './style.scss';

export default function JetpackProductSlideOutCardExample() {
	return (
		<div>
			<h3>Jetpack Product Slide Out Card – Jetpack Backup Daily</h3>
			<JetpackProductSlideOutCard
				className="docs__jetpack-product-slide-out-card"
				iconSlug={ 'jetpack_backup_daily_v2_dark' }
				productName={ 'Jetpack Backup Daily' }
				description={ 'Never lose a word, image, page, or time worrying about your site.' }
				currencyCode={ 'USD' }
				billingTimeFrame={ 'per month, billed yearly' }
				buttonLabel={ 'Get Backup Daily $8' }
				badgeLabel={ '' }
				onButtonClick={ () => alert( 'Hey!' ) }
				price={ 10 }
			/>
			<br />

			<h3>Jetpack Product Slide Out Card – Jetpack Scan (Owned)</h3>
			<JetpackProductSlideOutCard
				className="docs__jetpack-product-slide-out-card"
				iconSlug={ 'jetpack_scan_v2_dark' }
				productName={ 'Jetpack Scan' }
				description={ 'Never lose a word, image, page, or time worrying about your site.' }
				currencyCode={ 'USD' }
				billingTimeFrame={ 'per month, billed yearly' }
				buttonLabel={ 'Manage Subscription' }
				buttonPrimary={ false }
				badgeLabel={ 'Included in your plan' }
				onButtonClick={ () => alert( 'Hey!' ) }
				price={ 10 }
			/>
		</div>
	);
}

JetpackProductSlideOutCardExample.displayName = 'JetpackProductSlideOutCardExample';
