import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { FC, useState, useCallback, useEffect, useMemo } from 'react';
import QueryProducts from 'calypso/components/data/query-products-list';
import Loading from 'calypso/components/loading';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { requestUpdateJetpackCheckoutSupportTicket } from 'calypso/state/jetpack-checkout/actions';
import { getProductName, getProductsList } from 'calypso/state/products-list/selectors';
import getJetpackCheckoutSupportTicketDestinationSiteId from 'calypso/state/selectors/get-jetpack-checkout-support-ticket-destination-site-id';
import getJetpackCheckoutSupportTicketIncompatibleProductIds from 'calypso/state/selectors/get-jetpack-checkout-support-ticket-incompatible-products';
import getSupportTicketRequestStatus from 'calypso/state/selectors/get-jetpack-checkout-support-ticket-status';
import getJetpackSites from 'calypso/state/selectors/get-jetpack-sites';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { filterAllowedRedirect } from '../src/lib/pending-page';
import useGetJetpackActivationConfirmationInfo from './use-get-jetpack-activation-confirmation-info';

import './pending/style.scss';

interface Props {
	productSlug: string | 'no_product';
	receiptId?: number;
	source?: string;
	jetpackTemporarySiteId?: number;
	fromSiteSlug: string;
	redirectTo?: string;
}

type Product = {
	product_id: number;
	product_name: string;
	product_slug: string;
};

type JetpackSite = {
	ID: number;
	URL: string;
	is_wpcom_atomic: boolean;
	products: Product[];
	plan: Product;
	slug: string;
};

interface ProductsList {
	[ P: string ]: Product;
}

const LicensingPendingAsyncActivation: FC< Props > = ( {
	productSlug,
	receiptId = 0,
	source = 'connect-after-checkout',
	jetpackTemporarySiteId = 0,
	fromSiteSlug,
	redirectTo,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const hasProductInfo = productSlug !== 'no_product';

	const productName = useSelector( ( state ) =>
		hasProductInfo ? getProductName( state, productSlug ) : null
	);
	const productsList: ProductsList = useSelector( getProductsList );
	const jetpackSites = useSelector( getJetpackSites ) as JetpackSite[];

	const supportTicketRequestStatus = useSelector( ( state ) =>
		getSupportTicketRequestStatus( state, receiptId )
	);

	const destinationSiteId = useSelector( ( state ) =>
		getJetpackCheckoutSupportTicketDestinationSiteId( state, jetpackTemporarySiteId )
	);
	const incompatibleProductIds = useSelector( ( state ) =>
		getJetpackCheckoutSupportTicketIncompatibleProductIds( state, jetpackTemporarySiteId )
	);
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, destinationSiteId ) );
	const productConfirmationInfo = useGetJetpackActivationConfirmationInfo(
		destinationSiteId,
		productSlug
	);

	const [ selectedSite, setSelectedSite ] = useState( '' );
	const [ error, setError ] = useState< boolean >( false );

	const initialSelectedSite = useMemo( () => {
		if ( ! fromSiteSlug ) {
			return '';
		}
		const validSiteThatMatchesFromSiteSlugProp = ( site: JetpackSite ) =>
			site.is_wpcom_atomic === false && site.slug === fromSiteSlug;

		return jetpackSites.find( validSiteThatMatchesFromSiteSlugProp )?.URL || '';
	}, [ jetpackSites, fromSiteSlug ] );

	useEffect( () => {
		setSelectedSite( initialSelectedSite );
	}, [ initialSelectedSite ] );

	const licenseActivationPageUrl = useMemo( () => {
		return addQueryArgs(
			{
				receiptId,
				source: 'connect-after-checkout',
				jetpackTemporarySiteId,
				fromSiteSlug,
				redirect_to: redirectTo,
			},
			`/checkout/jetpack/thank-you/licensing-auto-activate/${ productSlug }`
		);
	}, [ receiptId, jetpackTemporarySiteId, fromSiteSlug, redirectTo, productSlug ] );

	const handleAutoActivate = useCallback(
		( siteUrl: string ) => {
			// Update the support ticket with the submitted site URL(selectedSite) and attempt to activate
			// the license (transfer the temporary-site subscription to the user's selectedSite).
			dispatch(
				requestUpdateJetpackCheckoutSupportTicket(
					siteUrl,
					receiptId,
					source,
					jetpackTemporarySiteId
				)
			);
		},
		[ dispatch, jetpackTemporarySiteId, receiptId, source ]
	);

	// Prevent auto-activation if it will fail at the initial attempt.
	const [ attemptAutoActivate, setAttemptAutoActivate ] = useState( true );
	useEffect( () => {
		if ( attemptAutoActivate && fromSiteSlug && initialSelectedSite.includes( fromSiteSlug ) ) {
			setAttemptAutoActivate( false );
			handleAutoActivate( initialSelectedSite );
		}
	}, [ attemptAutoActivate, fromSiteSlug, handleAutoActivate, initialSelectedSite ] );

	useEffect( () => {
		if (
			error ||
			supportTicketRequestStatus === undefined ||
			supportTicketRequestStatus === 'pending' ||
			( supportTicketRequestStatus === 'success' && destinationSiteId === undefined )
		) {
			return;
		}
		if (
			supportTicketRequestStatus === 'failed' ||
			( supportTicketRequestStatus === 'success' && incompatibleProductIds.length ) ||
			( supportTicketRequestStatus === 'success' && destinationSiteId === 0 )
		) {
			// If there is some sort of error, we redirect to the user license activation page where we can display an error.
			dispatch(
				recordTracksEvent( 'calypso_siteless_checkout_auto-activate-license', {
					product_slug: productSlug,
					site_url: initialSelectedSite,
					receipt_id: receiptId,
					status: 'failed',
				} )
			);
			setError( true );
			page( licenseActivationPageUrl );
			return;
		}

		// The license activation (subscription transfer) was successful!
		// ( supportTicketRequestStatus === 'success' && destinationSiteId == truthy )
		// If `redirectTo` exists, redirect to it, otherwise redirect to fallback url.
		const finalRedirect = filterAllowedRedirect(
			redirectTo ?? '',
			siteSlug ?? '',
			productConfirmationInfo.buttonUrl
		);
		dispatch(
			recordTracksEvent( 'calypso_siteless_checkout_auto-activate-license', {
				product_slug: productSlug,
				site_url: initialSelectedSite,
				receipt_id: receiptId,
				status: 'success',
				redirect_to: finalRedirect,
			} )
		);

		performRedirect( finalRedirect );
		return;
	}, [
		destinationSiteId,
		error,
		incompatibleProductIds,
		licenseActivationPageUrl,
		productName,
		productsList,
		productSlug,
		redirectTo,
		selectedSite,
		supportTicketRequestStatus,
		translate,
		siteSlug,
		productConfirmationInfo.buttonUrl,
		dispatch,
		initialSelectedSite,
		receiptId,
	] );

	return (
		<Main className="checkout-thank-you__pending">
			{ hasProductInfo && <QueryProducts type="jetpack" /> }
			<PageViewTracker
				options={ { useJetpackGoogleAnalytics: true } }
				path="/checkout/jetpack/thank-you/licensing-pending-async-activation/:product"
				properties={ { product_slug: productSlug } }
				title="Checkout > Jetpack Thank You Licensing Pending Async Activation"
			/>
			<PendingContent productName={ productName } siteUrl={ initialSelectedSite } />
		</Main>
	);
};

export default LicensingPendingAsyncActivation;

function PendingContent( {
	productName,
	siteUrl,
}: {
	productName: string | null;
	siteUrl: string;
} ) {
	const translate = useTranslate();
	const headingText = translate( 'Auto-activating your product license key.' );
	const productLabel = translate( 'Product' );
	const siteLabel = translate( 'Site' );

	return (
		<div className="pending-content__wrapper">
			<Loading title={ headingText } />
			<br />
			<div className="pending-content__info-text-container">
				{ productName && (
					<div className="pending-content__info-text">
						{ productLabel }: <span>{ productName }</span>
					</div>
				) }
				<div className="pending-content__info-text">
					{ siteLabel }: <span>{ siteUrl }</span>
				</div>
			</div>
		</div>
	);
}

function performRedirect( url: string ): void {
	if ( url.startsWith( '/' ) ) {
		page( url );
		return;
	}
	window.location.href = url;
}
