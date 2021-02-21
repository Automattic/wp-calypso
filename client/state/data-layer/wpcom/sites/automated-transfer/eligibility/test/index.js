/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	requestAutomatedTransferEligibility,
	updateAutomatedTransferEligibility,
	eligibilityHoldsFromApi,
} from 'calypso/state/data-layer/wpcom/sites/automated-transfer/eligibility';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';

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
		const dispatch = jest.fn();
		const getState = () => ( {
			sites: { items: { 2916284: { ID: 2916284, launch_status: 'unlaunched' } } },
		} );

		const action = { type: 'AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST', siteId: 2916284 };
		updateAutomatedTransferEligibility( action, { warnings: {}, errors: [] } )(
			dispatch,
			getState
		);

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				type: 'AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE',
				siteId: 2916284,
			} )
		);
	} );

	test( 'should dispatch an update eligibility action and map SITE_UNLAUNCHED ', () => {
		const dispatch = jest.fn();
		const getState = () => ( {
			sites: { items: { 2916284: { ID: 2916284, launch_status: 'unlaunched' } } },
		} );

		const action = { type: 'AUTOMATED_TRANSFER_ELIGIBILITY_REQUEST', siteId: 2916284 };
		updateAutomatedTransferEligibility( action, {
			warnings: {},
			errors: [ { code: 'site_private' } ],
		} )( dispatch, getState );

		expect( dispatch ).toHaveBeenCalledTimes( 1 );
		expect( dispatch ).toHaveBeenCalledWith(
			expect.objectContaining( {
				type: 'AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE',
				siteId: 2916284,
				eligibilityHolds: [ 'SITE_UNLAUNCHED' ],
			} )
		);
	} );
} );

describe( 'eligibilityHoldsFromApi', () => {
	test( 'maps errors to hold constants', () => {
		expect(
			eligibilityHoldsFromApi(
				{ errors: [ { code: 'site_graylisted' }, { code: 'no_ssl_certificate' } ] },
				{}
			)
		).toEqual( [ 'SITE_GRAYLISTED', 'NO_SSL_CERTIFICATE' ] );
	} );
	test( 'maps site_private to SITE_PRIVATE when site is launched', () => {
		expect( eligibilityHoldsFromApi( { errors: [ { code: 'site_private' } ] }, {} ) ).toEqual( [
			'SITE_PRIVATE',
		] );
	} );
	test( 'maps site_private to SITE_UNLAUNCHED when site is unlaunched', () => {
		expect(
			eligibilityHoldsFromApi(
				{ errors: [ { code: 'site_private' } ] },
				{ sitePrivateUnlaunched: true }
			)
		).toEqual( [ 'SITE_UNLAUNCHED' ] );
	} );
} );
