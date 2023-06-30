import { Button } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import WooProductDownload from 'calypso/jetpack-cloud/sections/partner-portal/download-products-form/woo-product-download';
import {
	getProductSlugFromKey,
	isWooCommerceProduct,
} from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { partnerPortalBasePath } from 'calypso/lib/jetpack/paths';
import { useSelector } from 'calypso/state';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import getSites from 'calypso/state/selectors/get-sites';
import './style.scss';

export default function DownloadProductsForm() {
	const translate = useTranslate();
	const sites = useSelector( getSites );
	const { data: allProducts } = useProductsQuery();

	const attachedSiteId = getQueryArg( window.location.href, 'attachedSiteId' ) as number;
	const licenseKeys = getQueryArg( window.location.href, 'products' ) as string;
	const source = getQueryArg( window.location.href, 'source' ) as string;

	const site = sites.find( ( site ) => site.ID === parseInt( attachedSiteId ) );

	const wooKeys =
		licenseKeys && licenseKeys.split( ',' ).filter( ( key ) => isWooCommerceProduct( key ) );

	const jetpackKeys =
		licenseKeys && licenseKeys.split( ',' ).filter( ( key ) => ! isWooCommerceProduct( key ) );

	const jetpackProducts =
		jetpackKeys &&
		jetpackKeys.map( ( licenseKey ) => {
			const productSlug = getProductSlugFromKey( licenseKey );
			const product =
				allProducts && allProducts.find( ( product ) => product.slug === productSlug );

			return (
				<li key={ licenseKey }>
					<h5>{ product && product.name }</h5>
					<pre>{ licenseKey }</pre>
				</li>
			);
		} );

	const wooProducts =
		wooKeys &&
		wooKeys.map( ( licenseKey ) => (
			<WooProductDownload
				key={ licenseKey }
				licenseKey={ licenseKey }
				allProducts={ allProducts }
			/>
		) );

	const onNavigate = () => {
		return page.redirect(
			'dashboard' === source
				? page.redirect( '/dashboard' )
				: page.redirect( partnerPortalBasePath( '/licenses' ) )
		);
	};

	return (
		<div className="download-products-form">
			<div className="download-products-form__top">
				<p className="download-products-form__description">
					{ translate(
						'Your license has been applied to {{strong}}%(siteUrl)s{{/strong}}, but more action is required.',
						'Your licenses have been applied to {{strong}}%(siteUrl)s{{/strong}}, but more action is required.',
						{
							args: { siteUrl: site && site.domain },
							components: { strong: <strong /> },
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
