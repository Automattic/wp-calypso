import { mutationOptions } from '@tanstack/react-query';
import {
	startSiteOwnerTransfer,
	checkSiteOwnerTransferEligibility,
	confirmSiteOwnerTransfer,
} from '../../data/site-owner-transfer';
import { queryClient } from '../query-client';
import { siteQueryFilter } from './site';
import type { SiteOwnerTransferContext } from '../../data/site-owner-transfer';

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
