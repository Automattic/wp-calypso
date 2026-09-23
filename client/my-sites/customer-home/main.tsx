import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import {
	CHECKOUT_SUCCESS_PLAN_PARAM,
	getCheckoutSuccessMessage,
} from 'calypso/dashboard/app/checkout-success-flash';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import {
	PLAN_AND_DOMAIN_NOTICE_QUERY_VALUE,
	PURCHASE_NOTICE_QUERY_KEY,
	PURCHASE_SUCCESS_NOTICE_QUERY_VALUE,
} from 'calypso/my-sites/checkout/checkout-thank-you/purchase-notice-constants';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import HomeContent from './components/home-content';
import type { SiteDetails } from '@automattic/data-stores';

/**
 * Checkout tags redirects to this page with `?notice=<value>`, plus
 * `?purchased_plan=<slug>` to name a new plan, so it can show a post-purchase
 * success toast on arrival. Read the params, dispatch the matching notice
 * once, then strip them from the URL so a refresh doesn't re-fire.
 */
function usePostPurchaseNotice(): void {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		const params = new URLSearchParams( window.location.search );
		const notice = params.get( PURCHASE_NOTICE_QUERY_KEY );
		if (
			notice !== PLAN_AND_DOMAIN_NOTICE_QUERY_VALUE &&
			notice !== PURCHASE_SUCCESS_NOTICE_QUERY_VALUE
		) {
			return;
		}

		const message =
			notice === PLAN_AND_DOMAIN_NOTICE_QUERY_VALUE
				? translate( 'Your plan and domain are ready!' )
				: getCheckoutSuccessMessage();
		reduxDispatch(
			successNotice( message, {
				id: 'post-purchase-success',
				duration: 10000,
			} )
		);

		params.delete( PURCHASE_NOTICE_QUERY_KEY );
		params.delete( CHECKOUT_SUCCESS_PLAN_PARAM );
		const newSearch = params.toString();
		const newUrl =
			window.location.pathname + ( newSearch ? `?${ newSearch }` : '' ) + window.location.hash;
		window.history.replaceState( window.history.state, '', newUrl );
	}, [ reduxDispatch, translate ] );
}

export default function CustomerHome( { site }: { site: SiteDetails } ) {
	const translate = useTranslate();

	usePostPurchaseNotice();

	return (
		<Main wideLayout>
			<PageViewTracker path="/home/:site" title={ translate( 'My Home' ) } />
			<DocumentHead title={ translate( 'My Home' ) } />
			{ site.options && <HomeContent /> }
		</Main>
	);
}
