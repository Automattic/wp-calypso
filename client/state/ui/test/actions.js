import {
	NOTIFICATIONS_PANEL_TOGGLE,
	MOST_RECENTLY_SELECTED_SITE_SET,
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
		test( 'should dispatch actions for clearing the selected site ID', () => {
			const mostRecentlySelectedSiteId = 123;
			const dispatch = jest.fn();
			const getState = jest.fn().mockReturnValue( {
				ui: {
					selectedSiteId: mostRecentlySelectedSiteId,
				},
			} );

			setAllSitesSelected()( dispatch, getState );

			expect( dispatch ).not.toHaveBeenCalledWith( {
				type: MOST_RECENTLY_SELECTED_SITE_SET,
				siteId: null,
			} );
			expect( dispatch ).toHaveBeenCalledWith( {
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
		test( 'should dispatch actions for selected site IDs', () => {
			const siteId = 2916284;
			const mostRecentlySelectedSiteId = 123;
			const dispatch = jest.fn();
			const getState = jest.fn().mockReturnValue( {
				ui: {
					selectedSiteId: mostRecentlySelectedSiteId,
				},
			} );

			setSelectedSiteId( siteId )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalledWith( {
				type: MOST_RECENTLY_SELECTED_SITE_SET,
				siteId,
			} );
			expect( dispatch ).toHaveBeenCalledWith( {
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
