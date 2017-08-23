/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import { translate } from 'i18n-calypso';
import {
	startSubmit as startSave,
	stopSubmit as stopSave,
} from 'redux-form';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import {
	announceFailure,
	announceZoneSaved,
	createZone,
	requestZonesError,
	requestZonesList,
	updateZonesList
} from '../';
import {
	requestError,
	requestZones,
	updateZone,
	updateZones
} from 'zoninator/state/zones/actions';
import { fromApi } from '../utils';

const apiResponse = {
	data: [
		{
			name: 'Test zone',
			slug: 'test-zone',
			description: 'A test zone.',
		}
	],
};

const zone = {
	none: 'New zone',
	description: 'A new zone',
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

describe( '#updateZonesList()', () => {
	it( 'should dispatch `updateZones`', () => {
		const dispatch = sinon.spy();
		const action = requestZones( 123456 );

		updateZonesList( { dispatch }, action, apiResponse );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( updateZones( 123456, map( [
			{
				name: 'Test zone',
				slug: 'test-zone',
				description: 'A test zone.',
			}
		], fromApi ) ) );
	} );
} );

describe( '#requestZonesError()', () => {
	it( 'should dispatch `requestError`', () => {
		const dispatch = sinon.spy();
		const action = requestError( 123456 );

		requestZonesError( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( requestError( 123456 ) );
	} );
} );

describe( '#createZone()', () => {
	it( 'should dispatch a HTTP request to create a new zone', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123456,
			data: zone,
			form: 'form',
		};

		createZone( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith( http( {
			method: 'POST',
			path: '/jetpack-blogs/123456/rest-api/',
			query: {
				body: JSON.stringify( zone ),
				json: true,
				path: '/zoninator/v1/zones',
			},
		}, action ) );
	} );

	it( 'should dispatch `startSave`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123456,
			data: zone,
			form: 'form',
		};

		createZone( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith( startSave( 'form' ) );
	} );

	it( 'should dispatch `removeNotice`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123456,
			data: zone,
			form: 'form',
		};

		createZone( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith( removeNotice( 'zoninator-zone-create' ) );
	} );
} );

describe( '#announceZoneSaved()', () => {
	it( 'should dispatch `stopSave`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123456,
			data: zone,
			form: 'form',
		};

		announceZoneSaved( dispatch, action, zone );

		expect( dispatch ).to.have.been.calledWith( stopSave( 'form' ) );
	} );

	it( 'should dispatch `updateZone`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123456,
			form: 'form',
		};

		announceZoneSaved( dispatch, action, zone );

		expect( dispatch ).to.have.been.calledWith( updateZone( 123456, fromApi( zone ) ) );
	} );

	it( 'should dispatch `successNotice`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123456,
			form: 'form',
		};

		announceZoneSaved( dispatch, action, zone );

		expect( dispatch ).to.have.been.calledWith( successNotice(
			translate( 'Zone saved!' ),
			{ id: 'zoninator-zone-create' },
		) );
	} );
} );

describe( '#announceFailure()', () => {
	it( 'should dispatch `stopSave`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123456,
			form: 'form',
		};

		announceFailure( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith( stopSave( 'form' ) );
	} );

	it( 'should dispatch `errorNotice`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123456,
			data: zone,
			form: 'form',
		};

		announceFailure( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith( errorNotice(
			translate( 'There was a problem saving the zone. Please try again.' ),
			{ id: 'zoninator-zone-create' },
		) );
	} );
} );
