import { Button } from '@automattic/components';
import { getQueryArg } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
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

	const jetpackProducts = jetpackKeys.map( ( licenseKey ) => {
		const productSlug = getProductSlugFromKey( licenseKey );
		const product = allProducts.find( ( product ) => product.slug === productSlug );

		return (
			<li key={ licenseKey }>
				<h4>{ product.name }</h4>
				<h6>{ licenseKey }</h6>
			</li>
		);
	} );

	const wooProducts = wooKeys.map( ( licenseKey ) => {
		const productSlug = licenseKey.split( '_' )[ 0 ];
		const product = allProducts.find( ( product ) => product.slug === productSlug );

		return (
			<li key={ licenseKey }>
				<h4>{ product.name }</h4>
				<h6>{ licenseKey }</h6>
				<Button compact>{ translate( 'Download' ) }</Button>
			</li>
		);
	} );

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
					<div className="download-products-form__no-action-items">
						<div>{ translate( 'No more action is required for these products:' ) }</div>
						<ul>{ jetpackProducts }</ul>
					</div>
				) }
				<div className="download-products-form__action-items">
					<div>{ translate( 'These extensions need to be downloaded and installed:' ) }</div>
					<ul>{ wooProducts }</ul>
				</div>
			</div>
		</div>
	);
}
