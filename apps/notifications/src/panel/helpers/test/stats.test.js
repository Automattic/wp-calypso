import { addTracksSurface, getTracksSurface, recordTracksEvent } from '../stats';

const lastEvent = () => window._tkq[ window._tkq.length - 1 ];

describe( 'recordTracksEvent', () => {
	let removers;

	const add = ( surface ) => {
		const remove = addTracksSurface( surface );
		removers.push( remove );
		return remove;
	};

	beforeEach( () => {
		window._tkq = [];
		removers = [];
	} );

	afterEach( () => {
		removers.forEach( ( remove ) => remove() );
	} );

	it( 'records the event as given when no surface is added', () => {
		recordTracksEvent( 'calypso_notification_note_like', { note_type: 'post' } );

		expect( lastEvent() ).toEqual( [
			'recordEvent',
			'calypso_notification_note_like',
			{ note_type: 'post' },
		] );
		expect( getTracksSurface() ).toBeUndefined();
	} );

	it( 'adds the surface until it is removed', () => {
		const remove = add( 'dashboard_page' );
		recordTracksEvent( 'calypso_notification_settings_click' );
		expect( lastEvent() ).toEqual( [
			'recordEvent',
			'calypso_notification_settings_click',
			{ surface: 'dashboard_page' },
		] );

		remove();
		recordTracksEvent( 'calypso_notification_settings_click' );
		expect( lastEvent() ).toEqual( [ 'recordEvent', 'calypso_notification_settings_click', {} ] );
	} );

	it( 'names the surface added last, and the earlier one again once that is removed', () => {
		add( 'dashboard_page' );
		const removePanel = add( 'dashboard_panel' );

		recordTracksEvent( 'calypso_notification_tab_select', { tab: 'unread' } );
		expect( lastEvent()[ 2 ] ).toEqual( { surface: 'dashboard_panel', tab: 'unread' } );

		removePanel();
		recordTracksEvent( 'calypso_notification_tab_select', { tab: 'all' } );
		expect( lastEvent()[ 2 ] ).toEqual( { surface: 'dashboard_page', tab: 'all' } );
	} );

	it( 'keeps the later surface when an earlier one is removed first', () => {
		const removePage = add( 'dashboard_page' );
		add( 'dashboard_panel' );

		removePage();
		recordTracksEvent( 'calypso_notification_open' );
		expect( lastEvent()[ 2 ] ).toEqual( { surface: 'dashboard_panel' } );
	} );

	it( 'keeps a surface read earlier, for an event recorded once a request returns', () => {
		const removePanel = add( 'dashboard_panel' );
		const surface = getTracksSurface();

		removePanel();
		recordTracksEvent( 'calypso_notification_load_more', { surface, total: 19 } );
		expect( lastEvent()[ 2 ] ).toEqual( { surface: 'dashboard_panel', total: 19 } );
	} );

	it( 'uses the current surface when the one read earlier was empty', () => {
		const surface = getTracksSurface();
		add( 'dashboard_page' );

		recordTracksEvent( 'calypso_notification_load_more', { surface, total: 19 } );
		expect( lastEvent()[ 2 ] ).toEqual( { surface: 'dashboard_page', total: 19 } );
	} );
} );
