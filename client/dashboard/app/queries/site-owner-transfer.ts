import {
	startSiteOwnerTransfer,
	checkSiteOwnerTransferEligibility,
	confirmSiteOwnerTransfer,
} from '../../data/site-owner-transfer';
import { queryClient } from '../query-client';
import { siteByIdQuery } from './site';
import type {
	SiteOwnerTransferConfirmation,
	SiteOwnerTransferContext,
} from '../../data/site-owner-transfer';

export const siteOwnerTransferMutation = ( siteId: number ) => ( {
	mutationFn: ( data: { new_site_owner: string; context?: SiteOwnerTransferContext } ) =>
		startSiteOwnerTransfer( siteId, data ),
} );

export const siteOwnerTransferEligibilityCheckMutation = ( siteId: number ) => ( {
	mutationFn: ( data: { new_site_owner: string } ) =>
		checkSiteOwnerTransferEligibility( siteId, data ),
} );

export const siteOwnerTransferConfirmMutation = ( siteId: number ) => ( {
	mutationFn: ( data: { hash: string } ) => confirmSiteOwnerTransfer( siteId, data ),
	onSuccess: ( { transfer }: SiteOwnerTransferConfirmation ) => {
		if ( transfer ) {
			// Invalidate queries as the site has been transferred to new owner.
			queryClient.invalidateQueries( siteByIdQuery( siteId ) );
		}
	},
} );
