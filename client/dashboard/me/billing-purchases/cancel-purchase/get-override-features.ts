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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getWpcomPlanFeatures( slug: string ): CancellationFeature[] | null {
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

function getMarketplaceFeatures( purchase: PurchaseForCopy ): CancellationFeature[] | null {
	if ( purchase.product_type === 'marketplace_theme' ) {
		return features(
			__( 'Access to this theme' ),
			__( 'Customizations you\u2019ve made to the theme' ),
			__( 'Theme-specific features and layouts' ),
			__( 'Automatic updates and security patches' )
		);
	}
	return features(
		__( 'Access to this plugin' ),
		__( 'Data and settings you\u2019ve created with the plugin' ),
		__( 'Features and functionality the plugin adds to your site' ),
		__( 'Automatic updates and security patches' )
	);
}

function isStorageAddon( slug: string ): boolean {
	return slug.endsWith( 'gb_space_upgrade' ) || slug === 'wordpress_com_1gb_space_addon_yearly';
}

function getAddonFeatures( slug: string ): CancellationFeature[] | null {
	if ( slug === 'unlimited_themes' ) {
		return features(
			__( 'Any premium theme currently active on your site' ),
			__( 'Access to the full premium theme collection' ),
			__( 'Professionally designed themes from expert creators' ),
			__( 'Automatic theme updates' )
		);
	}
	if ( isStorageAddon( slug ) ) {
		return features(
			__( 'Extra storage space' ),
			__( 'Space to keep uploading high-resolution photos and videos' ),
			__( 'Breathing room for your themes, plugins, backups, and posts' )
		);
	}
	if ( slug === 'custom-design' ) {
		return features(
			__( 'Custom CSS code you\u2019ve written for your site' ),
			__( 'Design changes beyond what the theme customizer allows' ),
			__( 'Fine-tuned control over your site\u2019s look and feel' )
		);
	}
	return null;
}
