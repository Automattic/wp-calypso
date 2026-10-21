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

// Shape wpcom.req rejects with for a WP_Error: `error` is the code, `data`
// the payload the endpoint attached.
interface WpcomReqError {
	error?: string;
	message?: string;
	data?: { kind?: string };
}

/**
 * When the endpoint asks for a clearer instruction (no run created), returns
 * the message to show inline; otherwise null so the caller falls back to a
 * generic hard-error reply. Checks `data.kind` and the WP_Error code, since a
 * transport layer can drop one or the other.
 */
export const getRefineClarificationMessage = ( err: unknown ): string | null => {
	if ( ! err || typeof err !== 'object' ) {
		return null;
	}
	const { error, message, data } = err as WpcomReqError;
	if ( data?.kind !== 'clarification_needed' && error !== 'a4a_clarification_needed' ) {
		return null;
	}
	return message || 'I need more detail to do that.';
};

export default function useRefineCollateralPage() {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< RefineCollateralPageResponse, unknown, RefineCollateralPageInput >( {
		mutationFn: ( { collateralPostId, instruction } ) => {
			if ( ! agencyId ) {
				throw new Error( 'useRefineCollateralPage: no active agency.' );
			}
			return wpcom.req.post( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/a4a/collaterals/${ collateralPostId }/refine`,
				body: { instruction },
			} );
		},
	} );
}
