/**
 * `POST /agency/<id>/a4a/collaterals/<post_id>/refine` — dispatches a
 * page-scoped refinement run; the endpoint parses the page number out of
 * the `instruction` server-side. Two outcomes the UI distinguishes:
 * success (`run_id` to poll) and clarification (a `400` whose message is
 * shown inline, no run created). Hard errors reject the mutation.
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

// Shape wpcom.req raises for a WP_Error: `error` is the code, `data` the payload.
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
	// Fall back to the WP_Error code if `data.kind` is dropped in transport.
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
					// Typed clarification so the caller can render it inline
					// instead of a generic hard-error banner.
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
