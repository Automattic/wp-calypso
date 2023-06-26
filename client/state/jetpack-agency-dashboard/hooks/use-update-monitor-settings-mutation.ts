import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type {
	APIError,
	UpdateMonitorSettingsAPIResponse as APIResponse,
	UpdateMonitorSettingsArgs,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

function mutationUpdateMonitorSettings( {
	siteId,
	params,
}: UpdateMonitorSettingsArgs ): Promise< APIResponse > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/sites/${ siteId }/jetpack-monitor-settings`,
		body: params,
	} );
}

export default function useUpdateMonitorSettingsMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, UpdateMonitorSettingsArgs, TContext >
): UseMutationResult< APIResponse, APIError, UpdateMonitorSettingsArgs, TContext > {
	return useMutation< APIResponse, APIError, UpdateMonitorSettingsArgs, TContext >( {
		...options,
		mutationFn: mutationUpdateMonitorSettings,
	} );
}
