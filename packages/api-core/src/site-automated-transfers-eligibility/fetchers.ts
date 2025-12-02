import { wpcom } from '../wpcom-fetcher';
import type { AutomatedTransferEligibility } from './types';

export async function fetchSiteAutomatedTransfersEligibility(
	siteId: number
): Promise< AutomatedTransferEligibility > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/automated-transfers/eligibility`,
		apiVersion: '1',
	} );
}
