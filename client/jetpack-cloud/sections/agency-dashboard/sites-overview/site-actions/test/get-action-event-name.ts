import getActionEventName from '../get-action-event-name';

describe( 'getActionEventName', () => {
	it( 'should return a large screen event if the screen is large', () => {
		expect( getActionEventName( 'issue_license', true ) ).toEqual(
			'calypso_jetpack_agency_dashboard_issue_license_large_screen'
		);
	} );

	it( 'should return a small screen event if the screen is not large', () => {
		expect( getActionEventName( 'visit_wp_admin', false ) ).toEqual(
			'calypso_jetpack_agency_dashboard_visit_wp_admin_small_screen'
		);
	} );
} );
