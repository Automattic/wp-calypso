import { WPCOM_FEATURES_COPY_SITE } from '@automattic/calypso-products';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import { useEffect, useMemo, useCallback } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { clearSignupDestinationCookie } from 'calypso/signup/storageUtils';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import {
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import isSiteAtomic from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { fetchSiteFeatures } from 'calypso/state/sites/features/actions';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

function useSafeSiteHasFeature( siteId: number, feature: string ) {
	const dispatch = useReduxDispatch();
	useEffect( () => {
		dispatch( fetchSiteFeatures( siteId ) );
	}, [ dispatch, siteId ] );

	return useSelector( ( state ) => {
		return siteHasFeature( state, siteId, feature );
	} );
}

export const useSiteCopy = ( site: SiteExcerptData ) => {
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const siteId = site.ID;
	const hasCopySiteFeature = useSafeSiteHasFeature( site.ID, WPCOM_FEATURES_COPY_SITE );
	const isAtomic = useSelector( ( state ) => isSiteAtomic( state, siteId ) );
	const plan = site?.plan;
	const isSiteOwner = site.site_owner === userId;
	useQuerySitePurchases( siteId );
	const isLoadingPurchase = useSelector(
		( state ) => isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state )
	);

	const { setPlanCartItem } = useDispatch( ONBOARD_STORE );

	const shouldShowSiteCopyItem = useMemo( () => {
		return hasCopySiteFeature && isSiteOwner && plan && isAtomic && ! isLoadingPurchase;
	}, [ hasCopySiteFeature, isSiteOwner, plan, isLoadingPurchase, isAtomic ] );

	const startSiteCopy = useCallback(
		//eslint-disable-next-line @typescript-eslint/no-explicit-any
		( eventName: string, extraProps?: Record< string, any > ) => {
			if ( ! plan ) {
				return;
			}
			clearSignupDestinationCookie();
			setPlanCartItem( { product_slug: plan.product_slug } );
			recordTracksEvent( eventName, extraProps );
		},
		[ plan, setPlanCartItem ]
	);

	return useMemo(
		() => ( {
			shouldShowSiteCopyItem,
			startSiteCopy,
		} ),
		[ shouldShowSiteCopyItem, startSiteCopy ]
	);
};

export const withSiteCopy = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { shouldShowSiteCopyItem, startSiteCopy } = useSiteCopy( props.site );
		return (
			<Wrapped
				{ ...props }
				shouldShowSiteCopyItem={ shouldShowSiteCopyItem }
				startSiteCopy={ startSiteCopy }
			/>
		);
	},
	'withSiteCopy'
);
