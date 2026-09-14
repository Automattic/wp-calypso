/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import preferencesReducer from 'calypso/state/preferences/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import SidebarBannerTemplate from '../sidebar-banner';

jest.mock( 'calypso/state/analytics/actions', () => ( {
	...jest.requireActual( 'calypso/state/analytics/actions' ),
	recordTracksEvent: jest.fn( () => ( { type: 'ANALYTICS_EVENT_RECORD' } ) ),
} ) );

// jsdom cannot navigate, so keep link clicks from logging "Not implemented" errors.
const preventNavigation = ( event ) => event.preventDefault();

function renderBanner( props ) {
	return renderWithProvider(
		<SidebarBannerTemplate
			id="upsell_jitm_id"
			message="Upgrade your plan"
			CTA={ { message: 'Upgrade', link: '/plans/example.com' } }
			isDismissible
			{ ...props }
		/>,
		{
			reducers: { preferences: preferencesReducer, ui: uiReducer },
			initialState: { preferences: { remoteValues: {} } },
		}
	);
}

describe( 'SidebarBannerTemplate', () => {
	beforeAll( () => {
		document.addEventListener( 'click', preventNavigation );
	} );

	afterAll( () => {
		document.removeEventListener( 'click', preventNavigation );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	test( 'records an impression naming the JITM it came from', () => {
		renderBanner();

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_banner_cta_impression',
			expect.objectContaining( { cta_name: 'upsell_jitm_id' } )
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_upsell_nudge_impression',
			expect.objectContaining( { event: 'upsell_jitm_id' } )
		);
	} );

	test( 'records a click naming the JITM it came from', async () => {
		const user = userEvent.setup();
		renderBanner();

		await user.click( screen.getByRole( 'link', { name: 'Upgrade' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_banner_cta_click',
			expect.objectContaining( { cta_name: 'upsell_jitm_id' } )
		);
	} );

	test( 'records a dismiss naming the JITM it came from', async () => {
		const user = userEvent.setup();
		renderBanner();

		await user.click( screen.getByLabelText( 'Dismiss' ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_banner_dismiss',
			expect.objectContaining( { cta_name: 'upsell_jitm_id' } )
		);
	} );
} );
