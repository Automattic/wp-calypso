/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { fetchZonesError, fetchZonesList, updateZonesList } from '../';
import { fetchError, fetchZones, updateZones } from 'zoninator/state/zones/actions';

const apiResponse = {
	data: [
		{
			name: 'Test zone',
			slug: 'test-zone',
			description: 'A test zone.',
		}
	],
};

describe( '#fetchExtensionSettings()', () => {
	it( 'should dispatch a HTTP request to the zones endpoint', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123456,
		};

		fetchZonesList( { dispatch }, action );

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
		const action = fetchZones( 123456 );

		updateZonesList( { dispatch }, action, null, apiResponse );

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

describe( '#fetchZonesError', () => {
	it( 'should dispatch `fetchError`', () => {
		const dispatch = sinon.spy();
		const action = fetchError( 123456 );

		fetchZonesError( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( fetchError( 123456 ) );
	} );
} );
