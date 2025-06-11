import {
	startSiteOwnerTransfer,
	checkSiteOwnerTransferEligibility,
	confirmSiteOwnerTransfer,
} from '../../data/site-owner-transfer';
import { queryClient } from '../query-client';
import { siteByIdQuery } from './site';
import type { SiteOwnerTransferConfirmation } from '../../data/site-owner-transfer';

export const siteOwnerTransferMutation = ( siteId: string ) => ( {
	mutationFn: ( data: { new_site_owner: string } ) => startSiteOwnerTransfer( siteId, data ),
} );

export const siteOwnerTransferEligibilityCheckMutation = ( siteId: string ) => ( {
	mutationFn: ( data: { new_site_owner: string } ) =>
		checkSiteOwnerTransferEligibility( siteId, data ),
} );

export const siteOwnerTransferConfirmMutation = ( siteId: string ) => ( {
	mutationFn: ( data: { hash: string } ) => confirmSiteOwnerTransfer( siteId, data ),
	onSuccess: ( { transfer }: SiteOwnerTransferConfirmation ) => {
		if ( transfer ) {
			// Invalidate queries as the site has been transferred to new owner.
			queryClient.invalidateQueries( siteByIdQuery( siteId ) );
		}
	},
} );
