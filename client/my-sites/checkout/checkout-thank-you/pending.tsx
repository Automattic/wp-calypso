import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryOrderTransaction from 'calypso/components/data/query-order-transaction';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { errorNotice } from 'calypso/state/notices/actions';
import {
	SUCCESS,
	ERROR,
	FAILURE,
	UNKNOWN,
	ASYNC_PENDING,
} from 'calypso/state/order-transactions/constants';
import getOrderTransaction from 'calypso/state/selectors/get-order-transaction';
import getOrderTransactionError from 'calypso/state/selectors/get-order-transaction-error';
import type { OrderTransaction } from 'calypso/state/selectors/get-order-transaction';

interface CheckoutPendingProps {
	orderId: number | ':orderId';
	receiptId: number | undefined;
	siteSlug?: string;
	redirectTo?: string;
}

/**
 * A page that polls the orders endpoint for a processing transaction and
 * redirects when done.
 *
 * There are two possible URLs that will render this page:
 *
 * - `/checkout/thank-you/:site/pending/:orderId`
 * - `/checkout/thank-you/no-site/pending/:orderId`
 *
 * The `orderId` prop comes from the last part of the URL and the `siteSlug`
 * prop comes from the `:site` part of the URL and will be empty if there is no
 * site.
 *
 * The `redirectTo` prop comes from the query string parameter of the same
 * name. It may include a literal `/pending` as part of the URL; if that's the
 * case, that string will be replaced by the receipt ID when the transaction
 * completes.
 */
function CheckoutPending( {
	orderId: orderIdOrPlaceholder,
	receiptId,
	siteSlug,
	redirectTo,
}: CheckoutPendingProps ) {
	const orderId = isValidOrderId( orderIdOrPlaceholder ) ? orderIdOrPlaceholder : undefined;
	const translate = useTranslate();
	const transaction: OrderTransaction | null = useSelector( ( state ) =>
		orderId ? getOrderTransaction( state, orderId ) : null
	);
	const error = useSelector( ( state ) =>
		orderId ? getOrderTransactionError( state, orderId ) : undefined
	);
	const reduxDispatch = useDispatch();
	const cartKey = useCartKey();
	const { reloadFromServer: reloadCart } = useShoppingCart( cartKey );
	const didRedirect = useRef( false );

	useEffect( () => {
		if ( didRedirect.current ) {
			return;
		}

		// Make sure the cart is always fresh if anything changes. This way, once
		// the order completes and the server empties the cart, the front-end will
		// get an updated cached cart and future pages will show the cart correctly
		// as empty.
		reloadCart();

		const retryOnError = () => {
			didRedirect.current = true;
			const defaultFailUrl = siteSlug ? `/checkout/${ siteSlug }` : '/';
			const failRedirectUrl = defaultFailUrl;

			reduxDispatch(
				errorNotice(
					translate( "Sorry, we couldn't process your payment. Please try again later." ),
					{
						isPersistent: true,
					}
				)
			);

			page( failRedirectUrl );
		};

		if ( receiptId ) {
			didRedirect.current = true;
			redirectWithInterpolatedReceipt( redirectTo, siteSlug, receiptId );
			return;
		}

		if ( ! orderId ) {
			// If the order ID is missing and there is no receiptId, we don't know
			// what to do because there's no way to know the status of the
			// transaction. If this happens it's definitely a bug, but let's keep the
			// existing behavior and send the user to a generic thank-you page,
			// assuming that the purchase was successful. This goes to the URL path
			// `/checkout/thank-you/:site/:receiptId` but without a receiptId.
			didRedirect.current = true;
			page( `/checkout/thank-you/${ siteSlug ?? 'no-site' }/unknown` );
			return;
		}

		const planRoute = siteSlug ? `/plans/my-plan/${ siteSlug }` : '/pricing';

		if ( transaction ) {
			const { processingStatus } = transaction;

			if ( SUCCESS === processingStatus ) {
				const { receiptId: transactionReceiptId } = transaction;

				didRedirect.current = true;
				redirectWithInterpolatedReceipt( redirectTo, siteSlug, transactionReceiptId );
				return;
			}

			if ( ASYNC_PENDING === transaction.processingStatus ) {
				didRedirect.current = true;
				page( '/me/purchases/pending' );
				return;
			}

			// If the processing status indicates that there was something wrong, it
			// could be because the user has cancelled the payment, or because the
			// payment failed after being authorized.
			if ( ERROR === processingStatus || FAILURE === processingStatus ) {
				// redirect users back to the checkout page so they can try again.
				retryOnError();
				return;
			}

			// The API has responded a status string that we don't expect somehow.
			if ( UNKNOWN === processingStatus ) {
				didRedirect.current = true;

				reduxDispatch(
					errorNotice( translate( 'Oops! Something went wrong. Please try again later.' ), {
						isPersistent: true,
					} )
				);

				// Redirect users back to the plan page so that they won't be stuck here.
				page( planRoute );
				return;
			}
		}

		// A HTTP error occured; we will send the user back to checkout.
		if ( error ) {
			retryOnError();
		}
	}, [
		error,
		redirectTo,
		reduxDispatch,
		siteSlug,
		transaction,
		translate,
		reloadCart,
		orderId,
		receiptId,
	] );

	return (
		<Main className="checkout-thank-you__pending">
			{ orderId && <QueryOrderTransaction orderId={ orderId } pollIntervalMs={ 5000 } /> }
			<PageViewTracker
				path={
					siteSlug
						? '/checkout/thank-you/:site/pending/:order_id'
						: '/checkout/thank-you/no-site/pending/:order_id'
				}
				title="Checkout Pending"
				properties={ { order_id: orderId, ...( siteSlug && { site: siteSlug } ) } }
			/>
			<EmptyContent
				illustration={ '/calypso/images/illustrations/illustration-shopping-bags.svg' }
				illustrationWidth={ 500 }
				title={ translate( 'Processing…' ) }
				line={ translate( "Almost there – we're currently finalizing your order." ) }
			/>
		</Main>
	);
}

function isValidOrderId( orderId: number | ':orderId' ): orderId is number {
	return Number.isInteger( orderId );
}

function redirectWithInterpolatedReceipt(
	url: string | undefined,
	siteSlug: string | undefined,
	receiptId: number
): void {
	if ( url?.includes( ':receiptId' ) ) {
		performRedirect( url.replaceAll( ':receiptId', `${ receiptId }` ), siteSlug );
		return;
	}

	// Only treat `/pending` as a placeholder if it's the end of the URL
	// pathname, but preserve query strings or hashes.
	const receiptPlaceholderRegexp = /\/pending([?#]|$)/;
	if ( url && receiptPlaceholderRegexp.test( url ) ) {
		performRedirect( url.replace( receiptPlaceholderRegexp, `/${ receiptId }$1` ), siteSlug );
		return;
	}

	if ( url ) {
		performRedirect( url, siteSlug );
		return;
	}

	const defaultSuccessUrl = siteSlug
		? `/checkout/thank-you/${ siteSlug }/${ receiptId }`
		: '/checkout/thank-you/no-site';
	performRedirect( defaultSuccessUrl, siteSlug );
}

function performRedirect( url: string, siteSlug: string | undefined ): void {
	if ( url.startsWith( '/' ) ) {
		page( url );
		return;
	}

	const allowedHostsForRedirect = [
		'wordpress.com',
		'calypso.localhost',
		'jetpack.cloud.localhost',
		'cloud.jetpack.com',
		siteSlug,
	];

	try {
		const parsedUrl = new URL( url );
		const { hostname, pathname } = parsedUrl;
		if ( ! hostname ) {
			throw new Error( `No hostname found for redirect '${ url }'` );
		}

		// For subdirectory site, check that both hostname and subdirectory matches
		// the siteSlug (host.name::subdirectory).
		if ( siteSlug?.includes( '::' ) ) {
			const [ hostnameFromSlug, ...subdirectoryParts ] = siteSlug.split( '::' );
			const subdirectoryPathFromSlug = subdirectoryParts.join( '/' );
			if (
				hostname !== hostnameFromSlug &&
				! pathname?.startsWith( `/${ subdirectoryPathFromSlug }` )
			) {
				throw new Error( `Redirect '${ url }' is not valid for subdirectory site '${ siteSlug }'` );
			}
			window.location.href = url;
			return;
		}

		if ( ! allowedHostsForRedirect.includes( hostname ) ) {
			throw new Error( `Invalid hostname '${ hostname }' for redirect '${ url }'` );
		}

		window.location.href = url;
	} catch ( err ) {
		// eslint-disable-next-line no-console
		console.error( `Redirecting to absolute url '${ url }' failed:`, err );
	}

	const fallbackUrl = '/checkout/thank-you/no-site';
	page( fallbackUrl );
}

export default function CheckoutPendingWrapper( props: CheckoutPendingProps ) {
	return (
		<CalypsoShoppingCartProvider>
			<CheckoutPending { ...props } />
		</CalypsoShoppingCartProvider>
	);
}
