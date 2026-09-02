/**
 * @jest-environment jsdom
 */

const mockRecordTracksEvent = jest.fn();

jest.mock( '@automattic/calypso-analytics', () => ( {
	...jest.requireActual( '@automattic/calypso-analytics' ),
	recordTracksEvent: mockRecordTracksEvent,
} ) );

const { recordDisconnectedHostTracksEvent, recordHostTracksEvent } = require( '../tracks' );

describe( 'recordHostTracksEvent', () => {
	beforeEach( () => {
		mockRecordTracksEvent.mockClear();
		delete globalThis.helpCenterData;
	} );

	it( 'adds site attribution from Help Center inline data', () => {
		globalThis.helpCenterData = { site: { ID: 123 } };

		recordHostTracksEvent( 'calypso_inlinehelp_show', { location: 'help-center' } );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_inlinehelp_show', {
			location: 'help-center',
			blog_id: 123,
			site_context_source: 'help_center_data',
		} );
	} );

	it( 'does not infer a site when Help Center data is unavailable', () => {
		recordHostTracksEvent( 'calypso_inlinehelp_show', {
			force_site_id: true,
			location: 'help-center',
		} );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_inlinehelp_show', {
			location: 'help-center',
			site_context_source: 'none',
		} );
	} );

	it( 'does not trust site data for disconnected host events', () => {
		globalThis.helpCenterData = { site: { ID: 123 } };

		recordDisconnectedHostTracksEvent( 'calypso_inlinehelp_show', {
			jetpack_disconnected_site: true,
		} );

		expect( mockRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_inlinehelp_show', {
			jetpack_disconnected_site: true,
			site_context_source: 'none',
		} );
	} );
} );
