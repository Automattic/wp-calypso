import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

interface Params {
	agency_id?: number;
	services: string[];
	products: string[];
	directories: {
		directory: 'wordpress' | 'jetpack' | 'woocommerce' | 'pressable';
		urls: string[];
		note: string;
	}[];
	feedback_url: string;
}

interface APIError {
	status: number;
	code: string | null;
	message: string;
	data?: any;
}

interface APIResponse {
	success: boolean;
}

function mutationSubmitPartnerDirectoryApplication( params: Params ): Promise< APIResponse > {
	if ( ! params.agency_id ) {
		throw new Error( 'Agency ID is required to issue a license' );
	}

	return wpcom.req.put( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ params.agency_id }/profile/application`,
		method: 'PUT',
		body: params,
	} );
}

export default function useSubmitPartnerDirectoryApplicationMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, Params, TContext >
): UseMutationResult< APIResponse, APIError, Params, TContext > {
	const agencyId = useSelector( getActiveAgencyId );

	return useMutation< APIResponse, APIError, Params, TContext >( {
		...options,
		mutationFn: ( args ) =>
			mutationSubmitPartnerDirectoryApplication( { ...args, agency_id: agencyId } ),
	} );
}
