/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import { waitFor } from '@testing-library/react';
import darkModeHelper from 'calypso/lib/dark-mode-helper';
import loadDevHelpers from '..';

jest.mock( '@automattic/calypso-config', () => {
	const mockConfig = jest.fn();
	mockConfig.isEnabled = jest.fn();

	return {
		__esModule: true,
		default: mockConfig,
	};
} );

jest.mock( 'calypso/lib/dark-mode-helper', () => ( {
	__esModule: true,
	default: jest.fn( ( element ) => {
		element.textContent = 'Theme';
	} ),
} ) );

describe( 'loadDevHelpers', () => {
	beforeEach( () => {
		config.isEnabled.mockImplementation( ( feature ) => feature === 'dark-mode' );
		darkModeHelper.mockClear();
		document.body.innerHTML = '';
	} );

	it( 'loads the dark mode helper into the server-rendered placeholder', async () => {
		document.body.innerHTML = `
			<div class="environment-badge">
				<div class="environment is-dark-mode"></div>
				<div class="environment is-prefs">Preferences</div>
				<span class="environment is-dev is-env">dev</span>
			</div>
		`;

		loadDevHelpers();
		await waitFor( () => expect( darkModeHelper ).toHaveBeenCalled() );

		const helperElement = document.querySelector( '.environment.is-dark-mode' );
		expect( helperElement ).not.toBeNull();
		expect( darkModeHelper ).toHaveBeenCalledWith( helperElement );
	} );
} );
