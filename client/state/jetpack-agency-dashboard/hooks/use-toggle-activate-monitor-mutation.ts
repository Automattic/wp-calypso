import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type {
	APIError,
	ToggleActivaateMonitorAPIResponse as APIResponse,
	ToggleActivateMonitorArgs,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

function mutationToggleActivateMonitor( {
	siteId,
	params,
}: ToggleActivateMonitorArgs ): Promise< APIResponse > {
	return wpcom.req.post( `/jetpack-blogs/${ siteId }/rest-api`, {
		path: '/jetpack/v4/module/monitor/active/',
		body: JSON.stringify( { active: params.monitor_active } ),
	} );
}

export default function useToggleActivateMonitorMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, ToggleActivateMonitorArgs, TContext >
): UseMutationResult< APIResponse, APIError, ToggleActivateMonitorArgs, TContext > {
	return useMutation< APIResponse, APIError, ToggleActivateMonitorArgs, TContext >( {
		...options,
		mutationFn: mutationToggleActivateMonitor,
	} );
}
