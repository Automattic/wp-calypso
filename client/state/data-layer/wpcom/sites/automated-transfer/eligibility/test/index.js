/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	requestAutomatedTransferEligibility,
	updateAutomatedTransferEligibility,
} from 'state/data-layer/wpcom/sites/automated-transfer/eligibility';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'requestAutomatedTransferEligibility', () => {
	test( 'should dispatch an http request', () => {
		const siteId = 2916284;
		const result = requestAutomatedTransferEligibility( { siteId } );
		expect( result ).toEqual(
			http(
				{
					method: 'GET',
					path: `/sites/${ siteId }/automated-transfers/eligibility`,
					apiVersion: '1',
				},
				{ siteId }
			)
		);
	} );
} );

describe( 'updateAutomatedTransferEligibility', () => {
	test( 'should dispatch an update eligibility action ', () => {
		const action = { type: 'AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST', siteId: 2916284 };
		const result = updateAutomatedTransferEligibility( action, { warnings: {}, errors: [] } );
		expect( result ).toMatchObject( {
			type: 'AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE',
			siteId: 2916284,
		} );
	} );
} );
