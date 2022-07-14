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
import { SUCCESS, ERROR, FAILURE, UNKNOWN } from 'calypso/state/order-transactions/constants';
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
 * site. In some cases (eg: free purchases which do not generate an order),
 * this could be the placeholder `:orderId`. If that happens and there is a
 * `receiptId` prop, the success redirect will still occur, but if it happens
 * when there is no `receiptId`, we cannot know what to do and the user will be
 * redirected to a generic thank-you page.
 *
 * The `redirectTo` prop comes from the query string parameter of the same
 * name. It may include a literal `/pending` as part of the URL; if that's the
 * case, that string will be replaced by the receipt ID when the transaction
 * completes.
 *
 * The `receiptId` prop comes from the query string parameter of the same name.
 * It must be numeric. If set, we know that the transaction is complete and
 * will skip polling for the order.
 */
function CheckoutPending( {
	orderId: orderIdOrPlaceholder,
	receiptId,
	siteSlug,
	redirectTo,
}: CheckoutPendingProps ) {
	const orderId = isValidOrderId( orderIdOrPlaceholder ) ? orderIdOrPlaceholder : undefined;
	const translate = useTranslate();

	useRedirectOnTransactionSuccess( {
		orderId,
		receiptId,
		siteSlug,
		redirectTo,
	} );

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

function interpolateReceiptId( url: string, receiptId: number ): string {
	if ( url.includes( ':receiptId' ) ) {
		return url.replaceAll( ':receiptId', `${ receiptId }` );
	}

	// Only treat `/pending` as a placeholder if it's the end of the URL
	// pathname, but preserve query strings or hashes.
	const receiptPlaceholderRegexp = /\/pending([?#]|$)/;
	if ( receiptPlaceholderRegexp.test( url ) ) {
		return url.replace( receiptPlaceholderRegexp, `/${ receiptId }$1` );
	}

	return url;
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

interface RedirectInstructions {
	url: string;
	errorNotice?: string;
}

interface RedirectForTransactionStatusArgs {
	error?: Error | null;
	transaction?: OrderTransaction | null;
	orderId?: number;
	receiptId?: number;
	redirectTo?: string;
	siteSlug?: string;
	translate: ReturnType< typeof useTranslate >;
}

function getRedirectForTransactionStatus( {
	error,
	transaction,
	orderId,
	receiptId,
	redirectTo,
	siteSlug,
	translate,
}: RedirectForTransactionStatusArgs ): RedirectInstructions | undefined {
	const defaultFailUrl = siteSlug ? `/checkout/${ siteSlug }` : '/';
	const defaultFailErrorNotice = translate(
		"Sorry, we couldn't process your payment. Please try again later."
	);
	const planRoute = siteSlug ? `/plans/my-plan/${ siteSlug }` : '/pricing';
	const defaultSuccessUrl =
		siteSlug && receiptId
			? `/checkout/thank-you/${ siteSlug }/${ receiptId }`
			: '/checkout/thank-you/no-site';

	// If there is a receipt ID, then the order must already be complete. In
	// that case, we can redirect immediately.
	if ( receiptId && redirectTo ) {
		return {
			url: interpolateReceiptId( redirectTo, receiptId ),
		};
	}
	if ( receiptId && ! redirectTo ) {
		return {
			url: interpolateReceiptId( defaultSuccessUrl, receiptId ),
		};
	}

	// If the order ID is missing and there is no receiptId, we don't know
	// what to do because there's no way to know the status of the
	// transaction. If this happens it's definitely a bug, but let's keep the
	// existing behavior and send the user to a generic thank-you page,
	// assuming that the purchase was successful. This goes to the URL path
	// `/checkout/thank-you/:site/:receiptId` but without a receiptId.
	if ( ! orderId ) {
		return {
			url: `/checkout/thank-you/${ siteSlug ?? 'no-site' }/unknown-receipt`,
		};
	}

	if ( transaction ) {
		const { processingStatus } = transaction;

		// If the order is complete, we can redirect to the final page.
		if ( SUCCESS === processingStatus ) {
			const { receiptId: transactionReceiptId } = transaction;

			return {
				url: interpolateReceiptId( redirectTo ?? defaultSuccessUrl, transactionReceiptId ),
			};
		}

		// If the processing status indicates that there was something wrong, it
		// could be because the user has cancelled the payment, or because the
		// payment failed after being authorized. Redirect users back to the
		// checkout page so they can try again.
		if ( ERROR === processingStatus || FAILURE === processingStatus ) {
			return {
				errorNotice: defaultFailErrorNotice,
				url: defaultFailUrl,
			};
		}

		// The API has responded a status string that we don't expect somehow.
		// Redirect users back to the plan page so that they won't be stuck here.
		if ( UNKNOWN === processingStatus ) {
			return {
				errorNotice: defaultFailErrorNotice,
				url: planRoute,
			};
		}
	}

	// A HTTP error occured; we will send the user back to checkout.
	if ( error ) {
		return {
			errorNotice: defaultFailErrorNotice,
			url: defaultFailUrl,
		};
	}

	return undefined;
}

function useRedirectOnTransactionSuccess( {
	orderId,
	receiptId,
	siteSlug,
	redirectTo,
}: {
	orderId: number | undefined;
	receiptId: number | undefined;
	siteSlug?: string;
	redirectTo?: string;
} ): void {
	const translate = useTranslate();
	const transaction: OrderTransaction | null = useSelector( ( state ) =>
		orderId ? getOrderTransaction( state, orderId ) : null
	);
	const error: Error | null = useSelector( ( state ) =>
		orderId ? getOrderTransactionError( state, orderId ) : null
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

		const redirectInstructions = getRedirectForTransactionStatus( {
			error,
			transaction,
			orderId,
			receiptId,
			redirectTo,
			siteSlug,
			translate,
		} );

		if ( ! redirectInstructions ) {
			return;
		}

		if ( redirectInstructions.errorNotice ) {
			reduxDispatch(
				errorNotice( redirectInstructions.errorNotice, {
					isPersistent: true,
				} )
			);
		}

		didRedirect.current = true;
		performRedirect( redirectInstructions.url, siteSlug );
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
}

export default function CheckoutPendingWrapper( props: CheckoutPendingProps ) {
	return (
		<CalypsoShoppingCartProvider>
			<CheckoutPending { ...props } />
		</CalypsoShoppingCartProvider>
	);
}
