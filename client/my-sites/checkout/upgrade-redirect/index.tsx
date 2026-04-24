import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import Loading from 'calypso/components/loading';
import Main from 'calypso/components/main';
import wpcom from 'calypso/lib/wp';

import './style.scss';

interface UpgradeRedirectProps {
	siteSlug: string;
	receiptId?: number;
}

interface RawPurchase {
	ID: number;
	site_slug: string;
	product_slug: string;
	subscription_status: string;
	is_plan: boolean;
}

function getDashboardPurchaseSettingsUrl( purchaseId: number ): string {
	const path = `/me/billing/purchases/${ purchaseId }?upgraded=true`;
	if ( config( 'env_id' ) === 'development' ) {
		return new URL( path, 'http://my.localhost:3000' ).href;
	}
	return new URL( path, 'https://my.wordpress.com' ).href;
}

function findActivePlan( purchases: RawPurchase[], siteSlug: string ): RawPurchase | undefined {
	return purchases
		.filter( ( p ) => p.site_slug === siteSlug && p.is_plan && p.subscription_status === 'active' )
		.sort( ( a, b ) => b.ID - a.ID )[ 0 ];
}

export default function UpgradeRedirect( { siteSlug, receiptId }: UpgradeRedirectProps ) {
	const translate = useTranslate();
	const hasRedirected = useRef( false );

	// Fast path: fetch the receipt to confirm checkout completed.
	// The receipt item IDs are NOT purchase subscription IDs, so we only
	// use this to know the transaction is done before fetching purchases.
	const { data: receiptConfirmed } = useQuery( {
		queryKey: [ 'upgrade-redirect-receipt', receiptId ],
		queryFn: async () => {
			await wpcom.req.get( {
				path: `/me/billing-history/receipt/${ receiptId }`,
				apiVersion: '1.2',
			} );
			return true;
		},
		enabled: Boolean( receiptId ),
	} );

	// Once receipt is confirmed, fetch purchases once to get the real subscription ID.
	const { data: receiptPurchase } = useQuery( {
		queryKey: [ 'upgrade-redirect-purchases', siteSlug, receiptId ],
		queryFn: async () => {
			const purchases: RawPurchase[] = await wpcom.req.get( '/me/purchases', {
				apiVersion: '1.1',
			} );
			return findActivePlan( purchases, siteSlug );
		},
		enabled: receiptConfirmed === true,
	} );

	// Slow fallback: poll /me/purchases when no receipt ID is available.
	const { data: polledPurchase } = useQuery( {
		queryKey: [ 'upgrade-redirect', siteSlug ],
		queryFn: async () => {
			const purchases: RawPurchase[] = await wpcom.req.get( '/me/purchases', {
				apiVersion: '1.1',
			} );
			return findActivePlan( purchases, siteSlug );
		},
		enabled: ! receiptId,
		refetchInterval: ( query ) => {
			return query.state.data ? false : 1000;
		},
	} );

	const purchaseId = receiptPurchase?.ID ?? polledPurchase?.ID;

	useEffect( () => {
		if ( purchaseId && ! hasRedirected.current ) {
			hasRedirected.current = true;
			window.location.href = getDashboardPurchaseSettingsUrl( purchaseId );
		}
	}, [ purchaseId ] );

	return (
		<Main className="checkout-thank-you__pending">
			<Loading
				className="checkout__pending-content"
				title={ translate( 'Almost there\u2014we\u2019re currently finalizing your order.' ) }
			/>
		</Main>
	);
}
