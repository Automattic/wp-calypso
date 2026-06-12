/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

jest.mock( 'calypso/state/ui/selectors' );
jest.mock( 'calypso/state/site-settings/selectors' );
jest.mock( 'calypso/state/site-settings/actions', () => ( {
	saveSiteSettings: jest.fn( () => ( { type: 'TEST_SAVE_SITE_SETTINGS' } ) ),
} ) );

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { unmountComponentAtNode } from 'react-dom';
import Modal from 'react-modal';
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
