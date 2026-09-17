import {
	isJetpackSearch,
	isJetpackSearchFree,
	planHasJetpackSearch,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import { urlToSlug } from 'calypso/lib/url';
import { getPurchaseListUrlFor } from 'calypso/my-sites/purchases/paths';
import type { RawSiteProduct } from 'calypso/state/sites/selectors/get-site-products';

interface Site {
	products?: RawSiteProduct[];
	plan?: { product_slug?: string; expired?: boolean };
}

interface Props {
	site: Site | null;
	siteUrl: string;
	product: string;
}

function getExistingSearchSource( site: Site, routeProduct: string ) {
	const searchProducts = ( site.products ?? [] ).filter(
		( product ) =>
			isJetpackSearch( product ) && ! isJetpackSearchFree( product ) && ! product.expired
	);
	if (
		searchProducts.some(
			( product ) => product.user_is_owner && product.product_slug === routeProduct
		)
	) {
		return 'renewal';
	}
	if ( searchProducts.length ) {
		return 'product';
	}

	const planSlug = site.plan?.product_slug;
	return planSlug && ! site.plan?.expired && planHasJetpackSearch( planSlug ) ? 'plan' : null;
}

export default function ExistingSearchNotice( { site, siteUrl, product }: Props ) {
	const translate = useTranslate();
	const source = siteUrl && site && getExistingSearchSource( site, product );

	if ( ! source ) {
		return null;
	}

	const components = {
		link: <a href={ getPurchaseListUrlFor( urlToSlug( siteUrl ) ) } />,
	};
	const texts = {
		plan: translate(
			"Jetpack Search is already included in this site's plan. {{link}}Manage subscriptions{{/link}}",
			{ components }
		),
		renewal: translate(
			'This site already has a Jetpack Search subscription. Continuing will renew it. {{link}}Manage subscriptions{{/link}}',
			{ components }
		),
		product: translate(
			'This site already has a Jetpack Search subscription. {{link}}Manage subscriptions{{/link}}',
			{ components }
		),
	};

	return (
		<div className="jetpack-connect__notices-container jetpack-connect__existing-search-notice">
			<Notice status="is-info" icon="notice" showDismiss={ false } text={ texts[ source ] } />
		</div>
	);
}
