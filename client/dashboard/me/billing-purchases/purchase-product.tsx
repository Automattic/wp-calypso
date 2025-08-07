import { Link } from '@tanstack/react-router';
import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { isTemporarySitePurchase, isA4ATemporarySitePurchase } from '../../utils/purchase';
import type { Purchase } from '../../data/purchase';
import type { Site } from '../../data/site';

function purchaseType( purchase: Purchase ): string | null {
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

	if ( isTemporarySitePurchase( purchase ) && isA4ATemporarySitePurchase( purchase ) ) {
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

export function PurchaseProduct( {
	purchase,
	site,
	getUrlForSiteLevelView,
}: {
	purchase: Purchase;
	site?: Site;
	getUrlForSiteLevelView: ( site: Site ) => string;
} ) {
	if ( isTemporarySitePurchase( purchase ) ) {
		return null;
	}

	const productType = purchaseType( purchase );

	if ( site ) {
		if ( productType && site.name && site.slug ) {
			return (
				<div>
					{ createInterpolateElement(
						sprintf(
							// translators: The string contains the product name, the name of the site, and the URL for the site e.g. Premium plan for Block Store (blockstore.com)
							__( '%(purchaseType)s for <siteName /> (<siteDomain />)' ),
							{
								purchaseType: productType,
							}
						),
						{
							siteName: (
								<Link
									to={ getUrlForSiteLevelView( site ) }
									title={
										// translators: the siteName is the name of the site
										sprintf( __( 'View active upgrades for %(siteName)s' ), {
											siteName: site.name,
										} )
									}
								>
									{ site.name }
								</Link>
							),
							siteDomain: (
								<ExternalLink
									href={ 'https://' + site.slug }
									rel="noreferrer"
									title={
										// translators: the siteName is the name of the site
										sprintf( __( 'View %(siteName)s' ), {
											siteName: site.name,
										} )
									}
								>
									{ site.slug }
								</ExternalLink>
							),
						}
					) }
				</div>
			);
		}

		if ( productType && site.slug ) {
			return (
				<div>
					{ createInterpolateElement(
						// translators: The string contains the product name, and the URL of the site e.g. Premium plan for blockstore.com
						sprintf( __( '%(purchaseType)s for <siteDomain />' ), {
							purchaseType: productType,
						} ),
						{
							siteDomain: (
								<Link
									to={ getUrlForSiteLevelView( site ) }
									title={
										// translators: the siteDomain is the domain of the site
										sprintf( __( 'View active upgrades for %(siteDomain)s' ), {
											siteDomain: site.slug,
										} )
									}
								>
									{ site.slug }
								</Link>
							),
						}
					) }
				</div>
			);
		}

		if ( site.name && site.slug ) {
			return (
				<div>
					{ createInterpolateElement(
						// translators: The string contains the name of the site, and the URL of the site e.g. for Block Store (blockstore.com)
						__( 'for <siteName /> (<siteDomain />)' ),
						{
							siteName: (
								<Link
									to={ getUrlForSiteLevelView( site ) }
									title={
										// translators: the siteName is the name of the site
										sprintf( __( 'View active upgrades for %(siteName)s' ), {
											siteName: site.name,
										} )
									}
								>
									{ site.name }
								</Link>
							),
							siteDomain: (
								<ExternalLink
									href={ 'https://' + site.slug }
									rel="noreferrer"
									title={
										// translators: the siteName is the name of the site
										sprintf( __( 'View %(siteName)s' ), {
											siteName: site.name,
										} )
									}
								>
									{ site.slug }
								</ExternalLink>
							),
						}
					) }
				</div>
			);
		}
	}

	if ( ! site && productType ) {
		return (
			<div>
				{ sprintf(
					// translators: The string contains the product name, and the URL of the site e.g. Premium plan for blockstore.com
					__( '%(purchaseType)s for %(site)s' ),
					{
						purchaseType: productType,
						site: purchase.domain,
					}
				) }
			</div>
		);
	}

	return productType;
}
