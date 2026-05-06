import { __ } from '@wordpress/i18n';
import { isGSuiteOrGoogleWorkspaceProductSlug } from '../../../utils/purchase';
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
function getDomainFeatures( _purchase: PurchaseForCopy ): CancellationFeature[] | null {
	return features(
		__( 'Your claim to this domain (anyone can register it once it\u2019s released)' ),
		__( 'Privacy protection on your contact info' ),
		__( 'Free SSL certificate' ),
		__( 'Email forwarding to your current inbox' ),
		__( 'DNS management through your dashboard' )
	);
}

function getEmailFeatures( slug: string ): CancellationFeature[] | null {
	if ( isGSuiteOrGoogleWorkspaceProductSlug( slug ) ) {
		return features(
			__( 'Your custom email address' ),
			__( 'Gmail, Calendar, and Contacts' ),
			__( 'Docs, Sheets, and Slides' ),
			__( '30 GB of cloud storage in Drive' ),
			__( 'Google Meet video calls' ),
			__( 'Real-time collaboration on shared files' )
		);
	}
	return features(
		__( 'Your custom email address' ),
		__( '30 GB of mailbox storage' ),
		__( 'Email, calendar, and contacts' ),
		__( 'Access on web and mobile' ),
		__( '24/7 email support' )
	);
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
