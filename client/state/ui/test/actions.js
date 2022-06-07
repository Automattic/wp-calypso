import {
	NOTIFICATIONS_PANEL_TOGGLE,
	SECTION_SET,
	SELECTED_SITE_SET,
} from 'calypso/state/action-types';
import {
	setAllSitesSelected,
	setSection,
	setSelectedSiteId,
	toggleNotificationsPanel,
} from '../actions';

describe( 'actions', () => {
	describe( 'setAllSitesSelected()', () => {
		test( 'should return an action object with a null siteId', () => {
			const action = setAllSitesSelected();

			expect( action ).toEqual( {
				type: SELECTED_SITE_SET,
				siteId: null,
			} );
		} );
	} );

	describe( 'setSection()', () => {
		test( 'should return an action object with the section specified', () => {
			const section = { name: 'me' };

			expect( setSection( section ) ).toEqual( {
				type: SECTION_SET,
				section,
			} );
		} );
	} );

	describe( 'setSelectedSiteId()', () => {
		test( 'should return an action object with the siteId set', () => {
			const siteId = 2916284;
			const action = setSelectedSiteId( siteId );

			expect( action ).toEqual( {
				type: SELECTED_SITE_SET,
				siteId,
			} );
		} );
	} );

	describe( 'toggleNotificationsPanel()', () => {
		test( 'should return an action object with just the action type', () => {
			expect( toggleNotificationsPanel() ).toEqual( {
				type: NOTIFICATIONS_PANEL_TOGGLE,
			} );
		} );
	} );
} );
