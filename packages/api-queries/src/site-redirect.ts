import { updateSiteRedirect } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';

export const siteRedirectUpdateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( location: string ) => updateSiteRedirect( siteId, location ),
	} );
