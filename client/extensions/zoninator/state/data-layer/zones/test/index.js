/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { translate } from 'i18n-calypso';
import reduxFormActions from 'redux-form/es/actions';
import sinon from 'sinon';

const { initialize, startSubmit, stopSubmit } = reduxFormActions;

/**
 * Internal dependencies
 */
import {
	announceDeleteFailure,
	announceSaveFailure,
	announceZoneDeleted,
	createZone,
	deleteZone,
	handleZoneCreated,
	handleZoneSaved,
	requestZonesError,
	requestZonesList,
	saveZone,
	updateZonesList,
} from '../';
import { fromApi } from '../utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import { navigate } from 'state/ui/actions';
import { requestError, requestZones, updateZone, updateZones } from 'zoninator/state/zones/actions';

const apiResponse = {
	data: [
		{
			term_id: 23,
			name: 'Test zone',
			slug: 'test-zone',
			description: 'A test zone.',
		},
	],
};

const zone = {
	term_id: 43,
	name: 'New zone',
	slug: 'new-zone',
	description: 'A new zone',
};

describe( '#requestZonesList()', () => {
	test( 'should dispatch a HTTP request to the zones endpoint', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123456,
		};

		requestZonesList( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					method: 'GET',
					path: '/jetpack-blogs/123456/rest-api/',
					query: {
						path: '/zoninator/v1/zones',
					},
				},
				action
			)
		);
	} );
} );

describe( '#updateZonesList()', () => {
	test( 'should dispatch `updateZones`', () => {
		const dispatch = sinon.spy();
		const action = requestZones( 123456 );

		updateZonesList( { dispatch }, action, apiResponse );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			updateZones(
				123456,
				{
					23: fromApi( apiResponse.data[ 0 ] ),
				},
				fromApi
			)
		);
	} );
} );

describe( '#requestZonesError()', () => {
	test( 'should dispatch `requestError`', () => {
		const dispatch = sinon.spy();
		const action = requestError( 123456 );

		requestZonesError( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith( requestError( 123456 ) );
	} );
} );

describe( '#createZone()', () => {
	test( 'should dispatch a HTTP request to create a new zone', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123456,
			data: zone,
			form: 'form',
		};

		createZone( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					method: 'POST',
					path: '/jetpack-blogs/123456/rest-api/',
					query: {
						body: JSON.stringify( zone ),
						json: true,
						path: '/zoninator/v1/zones',
					},
				},
				action
			)
		);
	} );

	test( 'should dispatch `startSave`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123456,
			data: zone,
			form: 'form',
		};

		createZone( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith( startSubmit( 'form' ) );
	} );

	test( 'should dispatch `removeNotice`', () => {
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

describe( '#saveZone()', () => {
	test( 'should dispatch `startSubmit`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			zoneId: 456,
			form: 'form',
			data: zone,
		};

		saveZone( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith( startSubmit( 'form' ) );
	} );

	test( 'should dispatch `removeNotice`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			zoneId: 456,
			form: 'form',
			data: zone,
		};

		saveZone( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith( removeNotice( 'zoninator-zone-create' ) );
	} );

	test( 'should dispatch a HTTP request to save the zone properties', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			zoneId: 456,
			form: 'form',
			data: zone,
		};

		saveZone( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					method: 'POST',
					path: '/jetpack-blogs/123/rest-api/',
					query: {
						body: JSON.stringify( zone ),
						json: true,
						path: '/zoninator/v1/zones/456&_method=PUT',
					},
				},
				action
			)
		);
	} );
} );

describe( '#handleZoneCreated()', () => {
	test( 'should dispatch `navigate`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			siteSlug: 'test.dev',
			form: 'form',
			data: { name: 'Test Zone' },
		};

		handleZoneCreated( { dispatch }, action, { data: zone } );

		expect( dispatch ).to.have.been.calledWith(
			navigate( '/extensions/zoninator/zone/test.dev/43' )
		);
	} );

	test( 'should dispatch `stopSave`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			siteSlug: 'test.dev',
			form: 'form',
			data: { name: 'Test Zone' },
		};

		handleZoneCreated( { dispatch }, action, { data: zone } );

		expect( dispatch ).to.have.been.calledWith( stopSubmit( 'form' ) );
	} );

	test( 'should dispatch `updateZone`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			siteSlug: 'test.dev',
			form: 'form',
			data: { name: 'Test Zone' },
		};

		handleZoneCreated( { dispatch }, action, { data: zone } );

		expect( dispatch ).to.have.been.calledWith( updateZone( 123, zone.term_id, fromApi( zone ) ) );
	} );

	test( 'should dispatch `successNotice`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			form: 'form',
			data: { name: 'Test Zone' },
		};

		handleZoneCreated( { dispatch }, action, { data: zone } );

		expect( dispatch ).to.have.been.calledWith(
			successNotice( translate( 'Zone saved!' ), { id: 'zoninator-zone-create' } )
		);
	} );
} );

describe( '#handleZoneSaved()', () => {
	test( 'should dispatch `initialize`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			zoneId: 456,
			form: 'form',
			data: { id: 456, name: 'After', description: 'A description' },
		};

		handleZoneSaved( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith(
			initialize( 'form', {
				id: 456,
				name: 'After',
				description: 'A description',
			} )
		);
	} );

	test( 'should dispatch `stopSave`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			zoneId: 456,
			form: 'form',
			data: { name: 'Test zone' },
		};

		handleZoneSaved( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith( stopSubmit( 'form' ) );
	} );

	test( 'should dispatch `updateZone`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			zoneId: 456,
			form: 'form',
			data: { id: 456, name: 'After', description: '' },
		};

		handleZoneSaved( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith(
			updateZone( 123, 456, {
				id: 456,
				name: 'After',
				description: '',
			} )
		);
	} );

	test( 'should dispatch `successNotice`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			zoneId: 456,
			form: 'form',
			data: { name: 'Test zone' },
		};

		handleZoneSaved( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith(
			successNotice( translate( 'Zone saved!' ), { id: 'zoninator-zone-create' } )
		);
	} );
} );

describe( '#announceSaveFailure()', () => {
	test( 'should dispatch `stopSubmit`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123456,
			form: 'form',
		};

		announceSaveFailure( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith( stopSubmit( 'form' ) );
	} );

	test( 'should dispatch `errorNotice`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123456,
			data: zone,
			form: 'form',
		};

		announceSaveFailure( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith(
			errorNotice( translate( 'There was a problem saving the zone. Please try again.' ), {
				id: 'zoninator-zone-create',
			} )
		);
	} );
} );

describe( '#deleteZone()', () => {
	test( 'should dispatch `removeNotice`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			zoneId: 456,
		};

		deleteZone( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith( removeNotice( 'zoninator-zone-delete' ) );
	} );

	test( 'should dispatch a HTTP request to delete the zone', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			zoneId: 456,
		};

		deleteZone( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith(
			http(
				{
					method: 'POST',
					path: '/jetpack-blogs/123/rest-api/',
					query: {
						path: '/zoninator/v1/zones/456&_method=DELETE',
					},
				},
				action
			)
		);
	} );
} );

describe( '#announceZoneDeleted()', () => {
	test( 'should dispatch `navigate`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			siteSlug: 'test.dev',
			zoneId: 456,
		};

		announceZoneDeleted( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith( navigate( '/extensions/zoninator/test.dev' ) );
	} );

	test( 'should dispatch `requestZones`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			siteSlug: 'test.dev',
			zoneId: 456,
		};

		announceZoneDeleted( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith( requestZones( 123 ) );
	} );

	test( 'should dispatch `successNotice`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			siteSlug: 'test.dev',
			zoneId: 456,
		};

		announceZoneDeleted( { dispatch }, action );

		expect( dispatch ).to.have.been.calledWith(
			successNotice( translate( 'The zone has been deleted.' ), { id: 'zoninator-zone-delete' } )
		);
	} );
} );

describe( '#announceDeleteFailure()', () => {
	test( 'should dispatch `errorNotice`', () => {
		const dispatch = sinon.spy();
		const action = {
			type: 'DUMMY_ACTION',
			siteId: 123,
			zoneId: 456,
		};

		announceDeleteFailure( { dispatch }, action );

		expect( dispatch ).to.have.been.calledOnce;
		expect( dispatch ).to.have.been.calledWith(
			errorNotice( translate( 'The zone could not be deleted. Please try again.' ), {
				id: 'zoninator-zone-delete',
			} )
		);
	} );
} );
