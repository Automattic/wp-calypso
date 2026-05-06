import { __ } from '@wordpress/i18n';
import { getProductCategory } from './get-confirmation-copy';
import type { PurchaseForCopy } from './get-confirmation-copy';
import type { CancellationFeature } from '@automattic/api-core';

function features( ...titles: string[] ): CancellationFeature[] {
	return titles.map( ( title, idx ) => ( {
		feature_id: `override-${ idx }`,
		title,
		description: '',
	} ) );
}

/**
 * Client-side override for cancellation features. When the split-cancel-remove
 * flag is on, this replaces the server-provided feature list with
 * benefit-oriented copy keyed by product slug and category.
 *
 * Returns null when no override exists — caller falls back to API features.
 */
export function getOverrideCancellationFeatures(
	purchase: PurchaseForCopy
): CancellationFeature[] | null {
	const slug = purchase.product_slug;
	const category = getProductCategory( purchase );

	switch ( category ) {
		case 'plan':
			return getWpcomPlanFeatures( slug );
		case 'domain':
			return getDomainFeatures( purchase );
		case 'email':
			return getEmailFeatures( slug );
		case 'jetpack':
			return getJetpackFeatures( slug );
		case 'akismet':
			return getAkismetFeatures();
		case 'marketplace':
			return getMarketplaceFeatures( purchase );
		case 'one-time':
		case 'other':
			return getAddonFeatures( slug );
	}
}

function getWpcomPlanFeatures( slug: string ): CancellationFeature[] | null {
	if ( slug.startsWith( 'personal-bundle' ) ) {
		return features(
			__( 'Custom domain for your site' ),
			__( '6 GB of storage' ),
			__( 'An ad-free experience for your visitors' ),
			__( 'Plugins and themes to extend your site' ),
			__( 'Customize fonts and colors' ),
			__( 'Audio uploads' ),
			__( 'Support from our team' )
		);
	}
	if ( slug.startsWith( 'value_bundle' ) ) {
		return features(
			__( 'Custom domain for your site' ),
			__( '13 GB of storage' ),
			__( 'An ad-free experience for your visitors' ),
			__( 'Plugins and themes to extend your site' ),
			__( 'Advanced design tools and custom CSS' ),
			__( 'Priority support' ),
			__( 'Earn money from ads on your site' ),
			__( 'Detailed visitor stats and insights' )
		);
	}
	if ( slug.startsWith( 'business-bundle' ) ) {
		return features(
			__( 'Custom domain for your site' ),
			__( '50 GB of storage' ),
			__( 'An ad-free experience for your visitors' ),
			__( 'Plugins and themes to extend your site' ),
			__( 'Priority 24/7 support' ),
			__( 'Developer tools like SFTP, SSH, Git, and GitHub Deployments' ),
			__( 'Staging sites to test changes safely' ),
			__( 'Daily backups with one-click restore' )
		);
	}
	if ( slug.startsWith( 'ecommerce-bundle' ) || slug.startsWith( 'ecommerce-trial' ) ) {
		return features(
			__( 'Custom domain for your site' ),
			__( 'Plugins and themes to extend your site' ),
			__( '50 GB of storage' ),
			__( 'Payments in 60+ countries' ),
			__( 'Sell and ship products worldwide' ),
			__( 'Integrations with shipping carriers' ),
			__( 'Marketing tools for your store' ),
			__( 'Priority 24/7 support' )
		);
	}
	return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getDomainFeatures( purchase: PurchaseForCopy ): CancellationFeature[] | null {
	return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getEmailFeatures( slug: string ): CancellationFeature[] | null {
	return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getJetpackFeatures( slug: string ): CancellationFeature[] | null {
	return null;
}

function getAkismetFeatures(): CancellationFeature[] | null {
	return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getMarketplaceFeatures( purchase: PurchaseForCopy ): CancellationFeature[] | null {
	return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getAddonFeatures( slug: string ): CancellationFeature[] | null {
	return null;
}
