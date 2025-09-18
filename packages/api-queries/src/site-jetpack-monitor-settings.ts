import { activateJetpackModule, createJetpackMonitorSettings } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';

type MonitorSettingsCreateResponse = {
	success: boolean;
	settings?: { monitor_active?: boolean };
};

type CreateVars = { siteId: number; body: Record< string, unknown > };

export const siteJetpackMonitorSettingsCreateMutation = () =>
	mutationOptions( {
		mutationFn: async ( vars: CreateVars ) => {
			const { siteId, body } = vars;
			// Activate monitor module before creating settings, mirroring legacy flow
			await activateJetpackModule( siteId, 'monitor' );
			// Allow time for module activation to propagate
			await new Promise( ( resolve ) => setTimeout( resolve, 3000 ) );
			const response: MonitorSettingsCreateResponse = await createJetpackMonitorSettings(
				siteId,
				body
			);
			if ( ! response?.settings?.monitor_active ) {
				throw new Error( 'Monitor is not active.' );
			}
			return response;
		},
		retry: ( failureCount: number, error: unknown ) => {
			const MAX_RETRIES = 3;
			if (
				error instanceof Error &&
				error.message === 'Monitor is not active.' &&
				failureCount < MAX_RETRIES
			) {
				return true;
			}
			return false;
		},
		retryDelay: 3000,
	} );
