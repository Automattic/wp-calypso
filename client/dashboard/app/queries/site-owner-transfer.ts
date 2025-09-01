import {
	startSiteOwnerTransfer,
	checkSiteOwnerTransferEligibility,
	confirmSiteOwnerTransfer,
} from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { queryClient } from '../query-client';
import { siteQueryFilter } from './site';
import type { SiteOwnerTransferContext } from '@automattic/api-core';

export const siteOwnerTransferMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( data: { new_site_owner: string; context?: SiteOwnerTransferContext } ) =>
			startSiteOwnerTransfer( siteId, data ),
	} );

export const siteOwnerTransferEligibilityCheckMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( data: { new_site_owner: string } ) =>
			checkSiteOwnerTransferEligibility( siteId, data ),
	} );

export const siteOwnerTransferConfirmMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( data: { hash: string } ) => confirmSiteOwnerTransfer( siteId, data ),
		onSuccess: ( { transfer } ) => {
			if ( transfer ) {
				// Invalidate queries as the site has been transferred to new owner.
				queryClient.invalidateQueries( siteQueryFilter( siteId ) );
			}
		},
	} );
