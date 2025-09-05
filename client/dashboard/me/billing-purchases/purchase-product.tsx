import { ExternalLink, Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { isTemporarySitePurchase, getSubtitleForDisplay } from '../../utils/purchase';
import type { Purchase, Site } from '@automattic/api-core';

export function PurchaseProduct( {
	purchase,
	site,
	filterViewBySite,
}: {
	purchase: Purchase;
	site?: Site;
	filterViewBySite: ( site: Site ) => void;
} ) {
	if ( isTemporarySitePurchase( purchase ) ) {
		return null;
	}

	const productType = getSubtitleForDisplay( purchase );

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
								<Button
									variant="link"
									onClick={ () => filterViewBySite( site ) }
									title={
										// translators: the siteName is the name of the site
										sprintf( __( 'View active upgrades for %(siteName)s' ), {
											siteName: site.name,
										} )
									}
								>
									{ site.name }
								</Button>
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
								<Button
									variant="link"
									onClick={ () => filterViewBySite( site ) }
									title={
										// translators: the siteDomain is the domain of the site
										sprintf( __( 'View active upgrades for %(siteDomain)s' ), {
											siteDomain: site.slug,
										} )
									}
								>
									{ site.slug }
								</Button>
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
								<Button
									variant="link"
									onClick={ () => filterViewBySite( site ) }
									title={
										// translators: the siteName is the name of the site
										sprintf( __( 'View active upgrades for %(siteName)s' ), {
											siteName: site.name,
										} )
									}
								>
									{ site.name }
								</Button>
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
