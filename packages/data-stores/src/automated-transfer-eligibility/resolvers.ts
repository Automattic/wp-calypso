import wpcomRequest from 'wpcom-proxy-request';
import { TransferEligibility, Dispatch } from './types';

/**
 * Requests the site's transfer eligibility from the WPCOM API.
 * @param   {number} siteId The id of the site to retrieve
 */
export const getAutomatedTransferEligibility =
	( siteId: number ) =>
	async ( { dispatch }: Dispatch ) => {
		const transferEligibility: TransferEligibility = await wpcomRequest( {
			path: `/sites/${ siteId }/automated-transfers/eligibility`,
			apiVersion: '1',
		} );
		dispatch.receiveTransferEligibility( transferEligibility, siteId );
	};
