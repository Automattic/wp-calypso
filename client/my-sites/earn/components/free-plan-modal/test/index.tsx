/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

jest.mock( 'calypso/state/ui/selectors' );
jest.mock( 'calypso/state/site-settings/selectors' );
jest.mock( 'calypso/state/site-settings/actions', () => ( {
	// Return a promise-returning thunk that resolves with a success-shaped
	// response (`{ updated }`, mirroring the real save), so the component can
	// chain `.then()` and treat the save as successful (it then refetches
	// memberships settings).
	saveSiteSettings: jest.fn( () => () => Promise.resolve( { updated: {} } ) ),
} ) );
jest.mock( 'calypso/state/memberships/settings/actions', () => ( {
	requestSettings: jest.fn( () => ( { type: 'TEST_REQUEST_SETTINGS' } ) ),
	refreshFreeTierDescriptionRendered: jest.fn( () => ( {
		type: 'TEST_REFRESH_FREE_TIER_RENDERED',
	} ) ),
} ) );

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { unmountComponentAtNode } from 'react-dom';
import Modal from 'react-modal';
import {
	requestSettings,
	refreshFreeTierDescriptionRendered,
} from 'calypso/state/memberships/settings/actions';
import { saveSiteSettings } from 'calypso/state/site-settings/actions';
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
		unmountComponentAtNode( modalRoot );
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
		// The description changed, so the rendered preview is refreshed with the
		// retry-until-updated thunk (Jetpack sync can lag the save), not a single
		// refetch.
		await waitFor( () => expect( refreshFreeTierDescriptionRendered ).toHaveBeenCalledWith( 1 ) );
		expect( requestSettings ).not.toHaveBeenCalled();
	} );

	test( 'refetches once (no retry poll) when only the hide flag changed', async () => {
		const user = userEvent.setup();
		getSiteSettings.mockReturnValue( {
			subscription_options: { free_tier_description: 'Existing copy', hide_free_tier: false },
		} );
		renderWithProvider( <FreePlanModal closeDialog={ closeDialog } siteId={ 1 } /> );

		// Toggle hide without touching the description: the rendered value can't
		// change, so a single refetch is enough.
		await user.click(
			screen.getByRole( 'checkbox', {
				name: 'Hide the free plan from the options shown to new subscribers',
			} )
		);
		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

		await waitFor( () => expect( requestSettings ).toHaveBeenCalledWith( 1 ) );
		expect( refreshFreeTierDescriptionRendered ).not.toHaveBeenCalled();
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
		expect( requestSettings ).not.toHaveBeenCalled();
		expect( refreshFreeTierDescriptionRendered ).not.toHaveBeenCalled();
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
