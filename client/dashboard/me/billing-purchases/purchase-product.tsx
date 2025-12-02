import { ExternalLink } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { purchasesRoute } from '../../app/router/me';
import RouterLinkButton from '../../components/router-link-button';
import { isTemporarySitePurchase, getSubtitleForDisplay } from '../../utils/purchase';
import type { Purchase, Site } from '@automattic/api-core';

export function PurchaseProduct( { purchase, site }: { purchase: Purchase; site?: Site } ) {
	if ( isTemporarySitePurchase( purchase ) ) {
		return null;
	}

	const productType = getSubtitleForDisplay( purchase );

	if ( site ) {
		if ( productType && site.name && site.slug ) {
			const linkTitle =
				site.name === site.slug
					? __( 'View site' )
					: // translators: the siteName is the name of the site
					  sprintf( __( 'View %(siteName)s' ), { siteName: site.name } );
			const linkText = site.name === site.slug ? __( 'View site' ) : site.slug;
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
								<RouterLinkButton
									variant="link"
									to={ purchasesRoute.fullPath }
									search={ { site: site.ID } }
									title={
										// translators: the siteName is the name of the site
										sprintf( __( 'View active upgrades for %(siteName)s' ), {
											siteName: site.name,
										} )
									}
								>
									{ site.name }
								</RouterLinkButton>
							),
							siteDomain: (
								<ExternalLink href={ 'https://' + site.slug } rel="noreferrer" title={ linkTitle }>
									{ linkText }
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
						// translators: The string contains the product name, the URL of the site, and a link to visit the site (e.g. "Premium plan for blockstore.com (view site)")
						sprintf( __( '%(purchaseType)s for <siteDomain /> (<viewSite />)' ), {
							purchaseType: productType,
						} ),
						{
							siteDomain: (
								<RouterLinkButton
									variant="link"
									to={ purchasesRoute.fullPath }
									search={ { site: site.ID } }
									title={
										// translators: the siteDomain is the domain of the site
										sprintf( __( 'View active upgrades for %(siteDomain)s' ), {
											siteDomain: site.slug,
										} )
									}
								>
									{ site.slug }
								</RouterLinkButton>
							),
							viewSite: (
								<ExternalLink
									href={ 'https://' + site.slug }
									rel="noreferrer"
									title={ __( 'View site' ) }
								>
									{ __( 'View site' ) }
								</ExternalLink>
							),
						}
					) }
				</div>
			);
		}

		if ( site.name && site.slug ) {
			const linkTitle =
				site.name === site.slug
					? __( 'View site' )
					: // translators: the siteName is the name of the site
					  sprintf( __( 'View %(siteName)s' ), { siteName: site.name } );
			const linkText = site.name === site.slug ? __( 'View site' ) : site.slug;
			return (
				<div>
					{ createInterpolateElement(
						// translators: The string contains the name of the site, and the URL of the site e.g. for Block Store (blockstore.com)
						__( 'for <siteName /> (<viewSite />)' ),
						{
							siteName: (
								<RouterLinkButton
									variant="link"
									to={ purchasesRoute.fullPath }
									search={ { site: site.ID } }
									title={
										// translators: the siteName is the name of the site
										sprintf( __( 'View active upgrades for %(siteName)s' ), {
											siteName: site.name,
										} )
									}
								>
									{ site.name }
								</RouterLinkButton>
							),
							viewSite: (
								<ExternalLink href={ 'https://' + site.slug } rel="noreferrer" title={ linkTitle }>
									{ linkText }
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
				{ createInterpolateElement(
					sprintf(
						// translators: The string contains the product name, the URL of the site, and a link to view the site (e.g. "Premium plan for blockstore.com (view site)")
						__( '%(purchaseType)s for %(site)s (<viewSite />)' ),
						{
							purchaseType: productType,
							site: purchase.domain,
						}
					),
					{
						viewSite: (
							<ExternalLink
								href={ 'https://' + purchase.domain }
								rel="noreferrer"
								title={ __( 'View site' ) }
							>
								{ __( 'View site' ) }
							</ExternalLink>
						),
					}
				) }
			</div>
		);
	}

	return productType;
}
