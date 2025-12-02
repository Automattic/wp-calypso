import { restoreDatabasePassword } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';

export const siteDatabaseMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => restoreDatabasePassword( siteId ),
	} );
