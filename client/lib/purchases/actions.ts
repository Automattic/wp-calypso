import { userPurchasesQuery } from '@automattic/api-queries';
import debugFactory from 'debug';
import wpcom from 'calypso/lib/wp';
import { getCancelPurchaseSurveyCompletedPreferenceKey } from 'calypso/me/purchases/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import type { CalypsoDispatch } from 'calypso/state/types';

const debug = debugFactory( 'calypso:purchases:actions' );

interface CancelResponse {
	success: boolean;
}

interface CancelAndRefundBody {
	product_id: number;
	cancel_bundled_domain?: number;
	email_variant?: string;
	type?: string;
	to_product_id?: number;
}

interface CancelAndRefundResponse {
	status?: string;
	message: string;
}

interface ExtendResponse {
	status: string;
	message: string;
}

interface SurveyResponse {
	success: boolean;
	err?: string;
}

// Purchase-mutating requests below bypass Redux, so consumers reading purchases
// through `@automattic/api-queries` (e.g. the manage-purchase page) won't see the
// change until their queries are refetched. Invalidate the `[ 'upgrades' ]` root
// key on the app's query client to cover every purchase query at once.
function invalidatePurchaseQueries() {
	getCalypsoQueryClient()?.invalidateQueries( userPurchasesQuery() );
}

export function cancelPurchase(
	purchaseId: number,
	onComplete: ( success: boolean ) => void
): void {
	wpcom.req.post(
		`/upgrades/${ purchaseId }/disable-auto-renew`,
		( error: Error | null, data: CancelResponse ) => {
			debug( error, data );

			const success = ! error && data.success;

			if ( success ) {
				invalidatePurchaseQueries();
			}

			onComplete( success );
		}
	);
}

export function cancelAndRefundPurchase(
	purchaseId: number,
	data: CancelAndRefundBody,
	onComplete?: ( error: Error | null, response: CancelAndRefundResponse ) => void
): void {
	wpcom.req.post(
		{
			path: `/purchases/${ purchaseId }/cancel`,
			body: data,
			apiNamespace: 'wpcom/v2',
		},
		( error: Error | null, response: CancelAndRefundResponse ) => {
			if ( ! error ) {
				invalidatePurchaseQueries();
			}

			onComplete?.( error, response );
		}
	);
}

export async function cancelPurchaseAsync( purchaseId: number ): Promise< boolean > {
	try {
		const data = await wpcom.req.post< CancelResponse >(
			`/upgrades/${ purchaseId }/disable-auto-renew`
		);
		debug( null, data );
		if ( data.success ) {
			invalidatePurchaseQueries();
		}
		return data.success;
	} catch ( error ) {
		debug( error, null );
		return false;
	}
}

export async function cancelAndRefundPurchaseAsync(
	purchaseId: number,
	data: CancelAndRefundBody
): Promise< CancelAndRefundResponse > {
	const response = await wpcom.req.post< CancelAndRefundResponse >( {
		path: `/purchases/${ purchaseId }/cancel`,
		body: data,
		apiNamespace: 'wpcom/v2',
	} );
	invalidatePurchaseQueries();
	return response;
}

export const submitSurvey =
	( surveyName: string, siteId: number, surveyData: Record< string, unknown > ) =>
	( dispatch: CalypsoDispatch ) => {
		return wpcom.req
			.post( '/marketing/survey', {
				survey_id: surveyName,
				site_id: siteId,
				survey_responses: surveyData,
			} )
			.then( ( res: SurveyResponse ) => {
				debug( 'Survey submit response', res );
				if ( ! res.success ) {
					dispatch( errorNotice( res.err ) );
				}
			} )
			.catch( ( err: Error ) => debug( err ) ); // shouldn't get here
	};

export const cancelPurchaseSurveyCompleted =
	( purchaseId: number | string ) => ( dispatch: CalypsoDispatch ) => {
		savePreference( getCancelPurchaseSurveyCompletedPreferenceKey( purchaseId ), true )( dispatch );
	};

export function disableAutoRenew(
	purchaseId: number,
	onComplete: ( success: boolean ) => void
): void {
	wpcom.req.post(
		`/upgrades/${ purchaseId }/disable-auto-renew`,
		( error: Error | null, data: CancelResponse ) => {
			debug( error, data );

			const success = ! error && data.success;

			if ( success ) {
				invalidatePurchaseQueries();
			}

			onComplete( success );
		}
	);
}

export function enableAutoRenew(
	purchaseId: number,
	onComplete: ( success: boolean ) => void
): void {
	wpcom.req.post(
		`/upgrades/${ purchaseId }/enable-auto-renew`,
		( error: Error | null, data: CancelResponse ) => {
			debug( error, data );

			const success = ! error && data.success;

			if ( success ) {
				invalidatePurchaseQueries();
			}

			onComplete( success );
		}
	);
}

export async function extendPurchaseWithFreeMonth( purchaseId: number ): Promise< ExtendResponse > {
	const response = await wpcom.req.post< ExtendResponse >( {
		path: `/purchases/${ purchaseId }/extend`,
		apiNamespace: 'wpcom/v2',
	} );
	invalidatePurchaseQueries();
	return response;
}
