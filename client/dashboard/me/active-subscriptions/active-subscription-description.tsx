import { Link } from '@tanstack/react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { isTemporarySitePurchase } from './util';
import type { ActiveSubscription } from '../../data/me-active-subscriptions';

function purchaseType( purchase: ActiveSubscription ): string | null {
	if ( 'theme' === purchase.product_type ) {
		return __( 'Premium Theme' );
	}

	if ( 'concierge-session' === purchase.product_slug ) {
		return __( 'One-on-one Support' );
	}

	if ( purchase.partner_name ) {
		if ( purchase.partner_type && [ 'agency', 'a4a_agency' ].includes( purchase.partner_type ) ) {
			return __( 'Agency Managed Plan' );
		}

		return __( 'Host Managed Plan' );
	}

	if ( purchase.is_plan ) {
		return __( 'Site Plan' );
	}

	if ( purchase.is_domain_registration ) {
		return purchase.product_name;
	}

	if ( purchase.product_slug === 'domain_map' ) {
		return purchase.product_name;
	}

	if ( isTemporarySitePurchase( purchase ) && purchase.product_type === 'akismet' ) {
		return null;
	}

	if ( isTemporarySitePurchase( purchase ) && purchase.product_type === 'saas_plugin' ) {
		return null;
	}

	if ( isTemporarySitePurchase( purchase ) && purchase.product_type === 'a4a' ) {
		return null;
	}

	if ( purchase.is_google_workspace_product && purchase.meta ) {
		return sprintf(
			// translators: The domain is the domain name of the site
			__( 'Mailboxes and Productivity Tools at %(domain)s' ),
			{
				domain: purchase.meta,
			}
		);
	}

	if ( purchase.is_titan_mail_product && purchase.meta ) {
		return sprintf(
			// translators: The domain is the domain name of the site
			__( 'Mailboxes at %(domain)s' ),
			{
				domain: purchase.meta,
			}
		);
	}

	if ( purchase.product_type === 'marketplace_plugin' || purchase.product_type === 'saas_plugin' ) {
		return __( 'Plugin' );
	}

	if ( purchase.meta ) {
		return purchase.meta;
	}

	return null;
}

export function ActiveSubscriptionDescription( {
	purchase,
	site,
	getUrlForSiteLevelView,
}: {
	purchase: ActiveSubscription;
	site?: { name: string; slug: string; ID: number };
	getUrlForSiteLevelView: ( siteId: number ) => string;
} ) {
	if ( isTemporarySitePurchase( purchase ) ) {
		return null;
	}

	const productType = purchaseType( purchase );

	if ( site ) {
		if ( productType && site.name && site.slug ) {
			return createInterpolateElement(
				sprintf(
					// translators: The string contains the product name, the name of the site, and the URL for the site e.g. Premium plan for Block Store (blockstore.com)
					__( '%(purchaseType)s for <button>%(siteName)s</button> (<link>%(siteDomain)s</link>)' ),
					{
						purchaseType: productType,
						siteName: site.name,
						siteDomain: site.slug,
					}
				),
				{
					button: (
						<Link
							to={ getUrlForSiteLevelView( site.ID ) }
							title={
								// translators: the siteName is the name of the site
								sprintf( __( 'View subscriptions for %(siteName)s' ), {
									siteName: site.name,
								} )
							}
						/>
					),
					link: (
						<a
							href={ 'https://' + site.slug }
							target="_blank"
							rel="noreferrer"
							title={
								// translators: the siteName is the name of the site
								sprintf( __( 'View %(siteName)s' ), {
									siteName: site.name,
								} )
							}
						/>
					),
				}
			);
		}

		if ( productType && site.slug ) {
			return createInterpolateElement(
				// translators: The string contains the product name, and the URL of the site e.g. Premium plan for blockstore.com
				sprintf( __( '%(purchaseType)s for <button>%(siteDomain)s</button>' ), {
					purchaseType: productType,
					siteDomain: site.slug,
				} ),
				{
					button: (
						<Link
							to={ getUrlForSiteLevelView( site.ID ) }
							title={
								// translators: the siteDomain is the domain of the site
								sprintf( __( 'View subscriptions for %(siteDomain)s' ), {
									siteName: site.slug,
								} )
							}
						/>
					),
				}
			);
		}

		if ( site.name && site.slug ) {
			return createInterpolateElement(
				// translators: The string contains the name of the site, and the URL of the site e.g. for Block Store (blockstore.com)
				sprintf( __( 'for <button>%(siteName)s</button> (<link>%(siteDomain)s</link>)' ), {
					siteName: site.name,
					siteDomain: site.slug,
				} ),
				{
					button: (
						<Link
							to={ getUrlForSiteLevelView( site.ID ) }
							title={
								// translators: the siteName is the name of the site
								sprintf( __( 'View subscriptions for %(siteName)s' ), {
									siteName: site.name,
								} )
							}
						/>
					),
					link: (
						<a
							href={ 'https://' + site.slug }
							target="_blank"
							rel="noreferrer"
							title={
								// translators: the siteName is the name of the site
								sprintf( __( 'View %(siteName)s' ), {
									siteName: site.name,
								} )
							}
						/>
					),
				}
			);
		}
	}

	if ( ! site && productType ) {
		// translators: The string contains the product name, and the URL of the site e.g. Premium plan for blockstore.com
		return sprintf( __( '%(purchaseType)s for %(site)s' ), {
			purchaseType: productType,
			site: purchase.domain,
		} );
	}

	return productType;
}
