import { isEnabled } from '@automattic/calypso-config';
import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom, { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import type { APIError } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

interface APIResponse {
	success: boolean;
}

interface InstallPluginParams {
	site_id: number;
	plugin_slug: string;
	agency_id?: number;
}

const client = isEnabled( 'a8c-for-agencies' ) ? wpcom : wpcomJpl;

function mutationInstallPlugin( params: InstallPluginParams ): Promise< APIResponse > {
	return client.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/jetpack-agency/sites/plugins/install',
		body: params,
	} );
}

export default function useInstallPlugin< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, APIError, InstallPluginParams, TContext >
): UseMutationResult< APIResponse, APIError, InstallPluginParams, TContext > {
	return useMutation< APIResponse, APIError, InstallPluginParams, TContext >( {
		...options,
		mutationFn: mutationInstallPlugin,
	} );
}
