/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

jest.mock( 'calypso/state/ui/selectors' );
jest.mock( 'calypso/state/site-settings/selectors' );
jest.mock( 'calypso/state/site-settings/actions', () => ( {
	// Return a promise-returning thunk that resolves with a success-shaped
	// response (`{ updated }`, mirroring the real save), so the component can
	// chain `.then()` and treat the save as successful (it then refetches site
	// settings to pick up the new server-rendered description).
	saveSiteSettings: jest.fn( () => () => Promise.resolve( { updated: {} } ) ),
	requestSiteSettings: jest.fn( () => ( { type: 'TEST_REQUEST_SITE_SETTINGS' } ) ),
} ) );

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from 'react-modal';
import { requestSiteSettings, saveSiteSettings } from 'calypso/state/site-settings/actions';
import { getSiteSettings } from 'calypso/state/site-settings/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { renderWithProvider } from '../../../../../test-helpers/testing-library';
import FreePlanModal from '../index';

const closeDialog = jest.fn();

describe( 'FreePlanModal', () => {
	let modalRoot;

	beforeEach( () => {
		jest.clearAllMocks();
		getSelectedSiteId.mockReturnValue( 1 );
		getSiteSettings.mockReturnValue( {
			subscription_options: { welcome: 'Hi', free_tier_description: '', hide_free_tier: false },
		} );

		modalRoot = document.createElement( 'div' );
		modalRoot.setAttribute( 'id', 'wpcom' );
		document.body.appendChild( modalRoot );
		Modal.setAppElement( modalRoot );
	} );

	afterEach( () => {
		document.body.removeChild( modalRoot );
		[ ...document.getElementsByClassName( 'ReactModalPortal' ) ].forEach( ( el ) =>
			document.body.removeChild( el )
		);
		modalRoot = null;
	} );

	test( 'saves the description and hide flag (as 1/0) into subscription_options', async () => {
		const user = userEvent.setup();
		renderWithProvider( <FreePlanModal closeDialog={ closeDialog } siteId={ 1 } /> );

		await user.type(
			screen.getByRole( 'textbox', { name: 'Describe what subscribers get at this tier' } ),
			'A free taste'
		);
		await user.click(
			screen.getByRole( 'checkbox', {
				name: 'Hide the free plan from the options shown to new subscribers',
			} )
		);
		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

		expect( saveSiteSettings ).toHaveBeenCalledWith( 1, {
			subscription_options: {
				welcome: 'Hi',
				free_tier_description: 'A free taste',
				hide_free_tier: 1,
			},
		} );
		expect( closeDialog ).toHaveBeenCalled();
		// On a successful save, refetch site settings so the Free row preview picks
		// up the new server-rendered description (returned by the same endpoint).
		await waitFor( () => expect( requestSiteSettings ).toHaveBeenCalledWith( 1 ) );
	} );

	test( 'does not refetch settings when the save fails', async () => {
		// `saveSiteSettings` resolves with an error object (no `updated`) on
		// failure, so the success-only follow-up work must not run.
		saveSiteSettings.mockReturnValueOnce( () => Promise.resolve( { error: 'nope' } ) );
		const user = userEvent.setup();
		renderWithProvider( <FreePlanModal closeDialog={ closeDialog } siteId={ 1 } /> );

		await user.type(
			screen.getByRole( 'textbox', { name: 'Describe what subscribers get at this tier' } ),
			'A free taste'
		);
		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

		expect( saveSiteSettings ).toHaveBeenCalled();
		// Flush the save promise and its `.then` before asserting the negative.
		await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
		expect( requestSiteSettings ).not.toHaveBeenCalled();
	} );

	test( 'pre-fills existing values and does not save on cancel', async () => {
		const user = userEvent.setup();
		getSiteSettings.mockReturnValue( {
			subscription_options: { free_tier_description: 'Existing copy', hide_free_tier: true },
		} );

		renderWithProvider( <FreePlanModal closeDialog={ closeDialog } siteId={ 1 } /> );

		expect(
			screen.getByRole( 'textbox', { name: 'Describe what subscribers get at this tier' } )
		).toHaveValue( 'Existing copy' );

		await user.click( screen.getByRole( 'button', { name: 'Cancel' } ) );

		expect( saveSiteSettings ).not.toHaveBeenCalled();
		expect( closeDialog ).toHaveBeenCalled();
	} );
} );
