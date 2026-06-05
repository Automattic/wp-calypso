/**
 * `POST /agency/<id>/a4a/collaterals/<post_id>/refine` — dispatches a
 * page-scoped refinement run against an existing collateral. The
 * wpcom endpoint parses the page number out of the natural-language
 * `instruction` server-side, so callers only pass the raw text.
 *
 * Two distinct outcomes the chat UI needs to distinguish:
 *
 *   - Success: `{ run_id, status, page, page_index }`. The UI starts
 *     polling `/a4a/runs/<run_id>` and bumps a thinking indicator.
 *   - Clarification: `400` with `data.kind === 'clarification_needed'`.
 *     The error's `message` is suitable for rendering inline as an
 *     assistant reply ("Which page?", "Page 99 doesn't exist…",
 *     "Page 1 is the cover…"). The UI surfaces this message and lets
 *     the user retry — no run was created.
 *
 * Hard errors (auth, server, network) come through as rejected
 * mutations and the UI shows a brief generic fallback message.
 */
import { useMutation } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export interface RefineCollateralPageInput {
	collateralPostId: number;
	instruction: string;
}

export interface RefineCollateralPageResponse {
	run_id: number;
	status: string;
	page: number;
	page_index: number;
}

export interface RefineCollateralPageClarification {
	kind: 'clarification_needed';
	message: string;
}

/**
 * Shape wpcom.req raises for a WP_Error response. `error` carries the
 * WP_Error code; `data` carries the `[ 'status' => …, 'kind' => … ]`
 * payload the endpoint attached.
 */
interface WpcomReqError {
	error?: string;
	message?: string;
	data?: { status?: number; kind?: string; [ key: string ]: unknown };
}

const isClarification = (
	err: unknown
): err is WpcomReqError & { data: { kind: 'clarification_needed' } } => {
	if ( ! err || typeof err !== 'object' ) {
		return false;
	}
	const data = ( err as WpcomReqError ).data;
	if ( ! data || typeof data !== 'object' ) {
		return false;
	}
	if ( data.kind === 'clarification_needed' ) {
		return true;
	}
	// Fall back to inspecting the WP_Error code in case `data.kind` is
	// dropped by a transport layer. The endpoint uses the code
	// `a4a_clarification_needed` for the same condition.
	return ( err as WpcomReqError ).error === 'a4a_clarification_needed';
};

export default function useRefineCollateralPage() {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation<
		RefineCollateralPageResponse,
		RefineCollateralPageClarification | Error,
		RefineCollateralPageInput
	>( {
		mutationFn: async ( { collateralPostId, instruction } ) => {
			if ( ! agencyId ) {
				throw new Error( 'useRefineCollateralPage: no active agency.' );
			}
			try {
				const response: RefineCollateralPageResponse = await wpcom.req.post( {
					apiNamespace: 'wpcom/v2',
					path: `/agency/${ agencyId }/a4a/collaterals/${ collateralPostId }/refine`,
					body: { instruction },
				} );
				return response;
			} catch ( err: unknown ) {
				if ( isClarification( err ) ) {
					const message =
						typeof err.message === 'string' ? err.message : 'I need more detail to do that.';
					// Throw a typed clarification so the caller's
					// `onError` branch can render the message as an
					// assistant chat reply without surfacing a generic
					// hard-error banner.
					const clarification: RefineCollateralPageClarification = {
						kind: 'clarification_needed',
						message,
					};
					throw clarification;
				}
				throw err instanceof Error ? err : new Error( 'Refine request failed.' );
			}
		},
	} );
}

export const isRefineClarification = ( err: unknown ): err is RefineCollateralPageClarification => {
	if ( ! err || typeof err !== 'object' ) {
		return false;
	}
	return ( err as RefineCollateralPageClarification ).kind === 'clarification_needed';
};
