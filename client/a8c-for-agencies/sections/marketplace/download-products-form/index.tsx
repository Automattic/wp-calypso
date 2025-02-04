import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import {
	A4A_LICENSES_LINK,
	A4A_SITES_LINK,
} from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import {
	getProductSlugFromLicenseKey,
	isWooCommerceProduct,
} from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import { useSelector } from 'calypso/state';
import getSites from 'calypso/state/selectors/get-sites';
import WooProductDownload from './woo-product-download';

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

	const jetpackProducts =
		jetpackKeys &&
		jetpackKeys.map( ( licenseKey: string ) => {
			const productSlug = getProductSlugFromLicenseKey( licenseKey );
			const product =
				allProducts &&
				allProducts.find( ( product ) => productSlug && product.slug.startsWith( productSlug ) );

			return (
				<li key={ licenseKey }>
					<h5>{ product && product.name }</h5>
					<pre>{ licenseKey }</pre>
				</li>
			);
		} );

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
		return page.redirect( 'dashboard' === source ? A4A_SITES_LINK : A4A_LICENSES_LINK );
	}, [ source ] );

	// redirect if licenseKeys does not contain a valid product
	useEffect( () => {
		if ( ! licenseKeys || ! allProducts || ! site ) {
			return;
		}

		const invalidKeys = licenseKeys.split( ',' ).filter( ( key ) => {
			const productSlug = getProductSlugFromLicenseKey( key );
			return ! allProducts.find(
				( product ) => productSlug && product.slug.startsWith( productSlug )
			);
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
				{ !! jetpackProducts.length && (
					<div className="download-products-form__action-items">
						<h4>{ translate( 'No more action is required for these products:' ) }</h4>
						<ul>{ jetpackProducts }</ul>
					</div>
				) }
				<div className="download-products-form__action-items">
					<h4>{ translate( 'These extensions need to be downloaded and installed:' ) }</h4>
					<ul>{ wooProducts }</ul>
				</div>
			</div>
		</div>
	);
}
