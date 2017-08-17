/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { requestZonesError, requestZonesList, updateZonesList } from '../';
import { requestError, requestZones, updateZones } from 'zoninator/state/zones/actions';

const apiResponse = {
	data: [
		{
			name: 'Test zone',
			slug: 'test-zone',
			description: 'A test zone.',
		}
	],
};

describe( '#requestZonesList()', () => {
	it( 'should dispatch a HTTP request to the zones endpoint', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123456,
		};

		requestZonesList( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( http( {
			method: 'GET',
			path: '/jetpack-blogs/123456/rest-api/',
			query: {
				path: '/zoninator/v1/zones',
			}
		}, action ) );
	} );
} );

describe( '#updateZonesList', () => {
	it( 'should dispatch `updateZones`', () => {
		const dispatch = sinon.spy();
		const action = requestZones( 123456 );

		updateZonesList( { dispatch }, action, apiResponse );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( updateZones( 123456, [
			{
				name: 'Test zone',
				slug: 'test-zone',
				description: 'A test zone.',
			}
		] ) );
	} );
} );

describe( '#requestZonesError', () => {
	it( 'should dispatch `requestError`', () => {
		const dispatch = sinon.spy();
		const action = requestError( 123456 );

		requestZonesError( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( requestError( 123456 ) );
	} );
} );
