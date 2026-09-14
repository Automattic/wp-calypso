import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import {
	PLAN_AND_DOMAIN_NOTICE_QUERY_VALUE,
	PURCHASE_NOTICE_QUERY_KEY,
} from 'calypso/my-sites/checkout/checkout-thank-you/purchase-notice-constants';
import { useDispatch } from 'calypso/state';
import { successNotice } from 'calypso/state/notices/actions';
import HomeContent from './components/home-content';
import type { SiteDetails } from '@automattic/data-stores';

/**
 * Pending checkout pages (`checkout-thank-you/pending`) tag certain redirect
 * URLs with `?notice=<value>` so the destination can show a post-purchase
 * success toast on arrival. Read the param, dispatch the matching notice once,
 * then strip it from the URL so a refresh doesn't re-fire.
 */
function usePostPurchaseNotice(): void {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		const params = new URLSearchParams( window.location.search );
		if ( params.get( PURCHASE_NOTICE_QUERY_KEY ) !== PLAN_AND_DOMAIN_NOTICE_QUERY_VALUE ) {
			return;
		}

		reduxDispatch(
			successNotice( translate( 'Your plan and domain are ready!' ), {
				id: 'plan-and-domain-purchase-success',
				duration: 10000,
			} )
		);

		params.delete( PURCHASE_NOTICE_QUERY_KEY );
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
