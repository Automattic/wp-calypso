import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type {
	APIError,
	ToggleActivaateMonitorAPIResponse as APIResponse,
	ToggleActivateMonitorArgs,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

function mutationToggleActivateMonitor( {
	siteId,
	params,
	hasJetpackPluginInstalled,
	agencyId,
}: ToggleActivateMonitorArgs ): Promise< APIResponse > {
	if ( hasJetpackPluginInstalled ) {
		return wpcom.req.post( `/jetpack-blogs/${ siteId }/rest-api`, {
			path: '/jetpack/v4/module/monitor/active/',
			body: JSON.stringify( { active: params.monitor_active } ),
		} );
	}
	// For A4A: If the site doesn't have the Jetpack plugin installed, we need to use the agency endpoint
	if ( ! agencyId ) {
		throw new Error( 'Agency ID is required for this operation' );
	}
	return wpcom.req.put( {
		method: 'PUT',
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/sites/${ siteId }/monitor`,
		body: { monitor_active: params.monitor_active },
	} );
}

export default function useToggleActivateMonitorMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, ToggleActivateMonitorArgs, TContext >
): UseMutationResult< APIResponse, APIError, ToggleActivateMonitorArgs, TContext > {
	const agencyId = useSelector( getActiveAgencyId );
	return useMutation< APIResponse, APIError, ToggleActivateMonitorArgs, TContext >( {
		...options,
		mutationFn: ( args ) => mutationToggleActivateMonitor( { ...args, agencyId } ),
	} );
}
