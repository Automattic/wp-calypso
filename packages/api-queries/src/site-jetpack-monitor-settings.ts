import { createJetpackMonitorSettings } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';

export const siteJetpackMonitorSettingsCreateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( body: object ) => createJetpackMonitorSettings( siteId, body ),
	} );
