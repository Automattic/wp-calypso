import { activateJetpackModule, createJetpackMonitorSettings } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';

type MonitorSettingsCreateResponse = {
	success: boolean;
	settings?: { monitor_active?: boolean };
};

export const siteJetpackMonitorSettingsCreateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: async ( body: Record< string, unknown > ) => {
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

export const siteJetpackMonitorSettingsBatchCreateMutation = () =>
	mutationOptions( {
		mutationKey: [ 'batch-create-monitor-settings' ],
		mutationFn: async ( items: Array< { siteId: number; body: Record< string, unknown > } > ) => {
			const results = await Promise.all(
				items.map( async ( { siteId, body } ) => {
					try {
						// Activate module
						await activateJetpackModule( siteId, 'monitor' );
						await new Promise( ( resolve ) => setTimeout( resolve, 3000 ) );

						// Try create with retry up to 3 attempts
						const MAX_RETRIES = 3;
						let lastError: unknown = null;
						for ( let attempt = 0; attempt < MAX_RETRIES; attempt++ ) {
							try {
								const response: MonitorSettingsCreateResponse = await createJetpackMonitorSettings(
									siteId,
									body
								);
								if ( response?.settings?.monitor_active ) {
									return { siteId, response } as const;
								}
								lastError = new Error( 'Monitor is not active.' );
							} catch ( e ) {
								lastError = e;
							}
							// wait 3s between retries
							await new Promise( ( resolve ) => setTimeout( resolve, 3000 ) );
						}
						throw lastError || new Error( 'Monitor settings creation failed' );
					} catch ( error ) {
						return { siteId, error } as const;
					}
				} )
			);
			return results;
		},
	} );
