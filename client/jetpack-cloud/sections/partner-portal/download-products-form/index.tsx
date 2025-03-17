import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import { CrmDownloadsContent } from 'calypso/components/crm-downloads/crm-downloads';
import WooProductDownload from 'calypso/jetpack-cloud/sections/partner-portal/download-products-form/woo-product-download';
import {
	getProductSlugFromLicenseKey,
	isWooCommerceProduct,
} from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import { partnerPortalBasePath } from 'calypso/lib/jetpack/paths';
import { useSelector } from 'calypso/state';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import getSites from 'calypso/state/selectors/get-sites';
import './style.scss';

export default function DownloadProductsForm() {
	const translate = useTranslate();
	const sites = useSelector( getSites );
	const { data: allProducts } = useProductsQuery();

	const attachedSiteId = getQueryArg( window.location.href, 'attachedSiteId' ) as string;
	const licenseKeys = getQueryArg( window.location.href, 'products' ) as string;
	const source = getQueryArg( window.location.href, 'source' ) as string;

	const site = sites.find( ( site ) => site?.ID === parseInt( attachedSiteId, 10 ) );
	const siteDomain = site ? site.domain : null;

	const wooKeys =
		licenseKeys && licenseKeys.split( ',' ).filter( ( key ) => isWooCommerceProduct( key ) );

	const jetpackKeys =
		licenseKeys && licenseKeys.split( ',' ).filter( ( key ) => ! isWooCommerceProduct( key ) );

	// Only show the first valid Jetpack Complete or CRM license key
	const validKeys =
		jetpackKeys &&
		jetpackKeys.filter(
			( key ) => key.startsWith( 'jetpack_complete' ) || key.startsWith( 'jetpack_crm' )
		);
	const validCompleteKey = validKeys?.length ? validKeys[ 0 ] : null;

	const wooProducts =
		wooKeys &&
		wooKeys.map( ( licenseKey: string ) => (
			<WooProductDownload
				key={ licenseKey }
				licenseKey={ licenseKey }
				allProducts={ allProducts }
			/>
		) );

	const onNavigate = useCallback( () => {
		return page.redirect(
			'dashboard' === source ? '/dashboard' : partnerPortalBasePath( '/licenses' )
		);
	}, [ source ] );

	// redirect if licenseKeys does not contain a valid product
	useEffect( () => {
		if ( ! licenseKeys || ! allProducts || ! site ) {
			return;
		}

		const invalidKeys = licenseKeys.split( ',' ).filter( ( key ) => {
			const productSlug = getProductSlugFromLicenseKey( key );
			return ! allProducts.find( ( product ) => product.slug === productSlug );
		} );

		if ( invalidKeys.length ) {
			onNavigate();
		}
	}, [ licenseKeys, allProducts, site, onNavigate ] );

	return (
		<div className="download-products-form">
			<div className="download-products-form__top">
				<p className="download-products-form__description">
					{ siteDomain &&
						translate(
							'Your license has been applied to {{strong}}%(siteUrl)s{{/strong}}, but more action is required.',
							'Your licenses have been applied to {{strong}}%(siteUrl)s{{/strong}}, but more action is required.',
							{
								components: { strong: <strong /> },
								args: { siteUrl: siteDomain || '' },
								count: licenseKeys.split( ',' ).length,
							}
						) }
				</p>
				<div className="download-products-form__controls">
					<Button primary className="download-products-form__navigate" onClick={ onNavigate }>
						{ translate( 'Done' ) }
					</Button>
				</div>
			</div>
			<div className="download-products-form__bottom">
				{ !! wooProducts.length && (
					<div className="download-products-form__action-items">
						<h4>{ translate( 'These extensions need to be downloaded and installed:' ) }</h4>
						<ul>{ wooProducts }</ul>
					</div>
				) }
				{ !! licenseKeys &&
					licenseKeys
						.split( ',' )
						.some(
							( key ) => key.startsWith( 'jetpack_complete' ) || key.startsWith( 'jetpack_crm' )
						) && (
						<div className="download-products-form__action-items">
							<h4>{ translate( 'Your license includes access to Jetpack CRM' ) }</h4>
							<CrmDownloadsContent licenseKey={ validCompleteKey || '' } />
						</div>
					) }
			</div>
		</div>
	);
}
