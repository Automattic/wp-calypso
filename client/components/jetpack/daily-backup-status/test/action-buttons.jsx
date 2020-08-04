/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';

/**
 * Internal dependencies
 */
import ActionButtons from '../action-buttons';

/**
 * Mocked dependencies
 */
jest.mock( 'state/ui/selectors' );
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

jest.mock( 'state/selectors/get-does-rewind-need-credentials' );
import getDoesRewindNeedCredentials from 'state/selectors/get-does-rewind-need-credentials';

function render( component ) {
	const store = {
		getState: () => ( {} ),
		subscribe: () => {},
		dispatch: () => {},
	};
	return mount( <Provider store={ store }>{ component }</Provider> );
}

describe( 'ActionButtons', () => {
	beforeAll( () => {
		getSelectedSiteId.mockImplementation( () => 0 );
		getSelectedSiteSlug.mockImplementation( () => '' );
	} );

	test( "disables all buttons when 'rewindId' is not provided", () => {
		const wrapper = render( <ActionButtons /> );

		expect(
			wrapper.find( 'button.daily-backup-status__download-button' ).prop( 'disabled' )
		).toEqual( true );
	} );

	test( "disables all buttons when 'disabled' is true", () => {
		const wrapper = render( <ActionButtons disabled rewindId="test" /> );

		expect(
			wrapper.find( 'button.daily-backup-status__download-button' ).prop( 'disabled' )
		).toEqual( true );
	} );

	test( "enables the download button when 'rewindId' is provided'", () => {
		const wrapper = render( <ActionButtons rewindId="test" /> );
		const downloadButton = wrapper.find( 'a.daily-backup-status__download-button' );

		expect( downloadButton.prop( 'href' ) ).toBeTruthy();
	} );

	test( 'enables the restore button when credentials are not needed', () => {
		getDoesRewindNeedCredentials.mockImplementation( () => false );

		const wrapper = render( <ActionButtons rewindId="test" /> );
		const restoreButton = wrapper.find( 'a.daily-backup-status__restore-button' );

		expect( restoreButton.length ).toEqual( 1 );
		expect( restoreButton.prop( 'href' ) ).toBeTruthy();
	} );

	test( 'disables the restore button when credentials are needed', () => {
		getDoesRewindNeedCredentials.mockImplementation( () => true );

		const wrapper = render( <ActionButtons rewindId="test" /> );
		const restoreButton = wrapper.find( 'button.daily-backup-status__restore-button' );

		expect( restoreButton.prop( 'disabled' ) ).toEqual( true );
	} );

	test( "shows 'Activate restores' prompt when credentials are needed", () => {
		getDoesRewindNeedCredentials.mockImplementation( () => true );

		const wrapper = render( <ActionButtons rewindId="test" /> );
		const activateButton = wrapper.find( 'a.daily-backup-status__activate-restores-button' );

		expect( activateButton.length ).toEqual( 1 );
		expect( activateButton.prop( 'href' ) ).toBeTruthy();
	} );
} );
