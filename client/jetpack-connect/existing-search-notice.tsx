import {
	isJetpackSearch,
	isJetpackSearchFree,
	planHasJetpackSearch,
} from '@automattic/calypso-products';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import Notice from 'calypso/components/notice';
import { isExpiredOrRemoved } from 'calypso/lib/purchases';
import { urlToSlug } from 'calypso/lib/url';
import { getPurchaseListUrlFor } from 'calypso/my-sites/purchases/paths';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { getPurchases } from 'calypso/state/purchases/selectors';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { RawSiteProduct } from 'calypso/state/sites/selectors/get-site-products';

interface Site {
	ID?: number;
	jetpack_connection?: boolean;
	is_wpcom_atomic?: boolean;
	is_wpcom_flex?: boolean;
	is_garden?: boolean;
	options?: { is_wpcom_atomic?: boolean };
	products?: RawSiteProduct[];
	plan?: { product_slug?: string; expired?: boolean };
}

interface Props {
	site: Site | null;
	siteUrl: string;
	product: string;
}

interface SearchSubscription {
	slug: string;
	owned: boolean;
}

// `/me/sites` never lists `wpcom_search*` products, so sites hosted on WordPress.com also need their purchases.
// `jetpack` is false for sites connected only through a standalone Jetpack plugin, so use `jetpack_connection`,
// with the same WordPress.com-hosted exceptions as `isSelfHostedJetpackConnected` in `client/dashboard/utils/site-types.ts`.
function isHostedOnWpcom( site: Site | null ) {
	return (
		!! site &&
		( site.jetpack_connection === false ||
			!! site.is_wpcom_atomic ||
			!! site.options?.is_wpcom_atomic ||
			!! site.is_wpcom_flex ||
			!! site.is_garden )
	);
}

function getExistingSearchSource(
	site: Site,
	purchases: Purchase[],
	userId: number | null,
	routeProduct: string
) {
	const subscriptions: SearchSubscription[] = [
		...( site.products ?? [] )
			.filter(
				( product ) =>
					isJetpackSearch( product ) && ! isJetpackSearchFree( product ) && ! product.expired
			)
			.map( ( product ) => ( { slug: product.product_slug, owned: !! product.user_is_owner } ) ),
		...purchases
			.filter(
				( purchase ) =>
					isJetpackSearch( purchase ) &&
					! isJetpackSearchFree( purchase ) &&
					! isExpiredOrRemoved( purchase )
			)
			.map( ( purchase ) => ( {
				slug: purchase.productSlug,
				owned: !! userId && purchase.userId === userId,
			} ) ),
	];
	if ( subscriptions.some( ( { slug, owned } ) => owned && slug === routeProduct ) ) {
		return 'renewal';
	}
	if ( subscriptions.length ) {
		return 'product';
	}

	const planSlug = site.plan?.product_slug;
	return planSlug && ! site.plan?.expired && planHasJetpackSearch( planSlug ) ? 'plan' : null;
}

export default function ExistingSearchNotice( { site, siteUrl, product }: Props ) {
	const translate = useTranslate();
	const purchasesSiteId = siteUrl && isHostedOnWpcom( site ) ? site?.ID : null;
	useQuerySitePurchases( purchasesSiteId );
	const allPurchases: Purchase[] = useSelector( getPurchases );
	const purchases = useMemo(
		() =>
			purchasesSiteId
				? allPurchases.filter( ( purchase ) => purchase.siteId === purchasesSiteId )
				: [],
		[ allPurchases, purchasesSiteId ]
	);
	const userId = useSelector( getCurrentUserId );
	const source = siteUrl && site && getExistingSearchSource( site, purchases, userId, product );

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
