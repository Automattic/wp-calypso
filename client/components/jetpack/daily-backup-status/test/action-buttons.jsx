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
jest.mock( 'calypso/state/ui/selectors' );
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

jest.mock( 'calypso/state/selectors/get-does-rewind-need-credentials' );
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';

import * as record from 'calypso/state/analytics/actions/record';
const recordTracksEvent = jest.spyOn( record, 'recordTracksEvent' );

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

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( "disables all buttons when 'rewindId' is not provided", () => {
		const wrapper = render( <ActionButtons /> );
		const downloadButton = wrapper.find( '.daily-backup-status__download-button' ).hostNodes();
		const restoreButton = wrapper.find( '.daily-backup-status__restore-button' ).hostNodes();

		expect( downloadButton.prop( 'disabled' ) ).toEqual( true );
		expect( restoreButton.prop( 'disabled' ) ).toEqual( true );
	} );

	test( "disables all buttons when 'disabled' is true", () => {
		const wrapper = render( <ActionButtons disabled rewindId="test" /> );
		const downloadButton = wrapper.find( '.daily-backup-status__download-button' ).hostNodes();
		const restoreButton = wrapper.find( '.daily-backup-status__restore-button' ).hostNodes();

		expect( downloadButton.prop( 'disabled' ) ).toEqual( true );
		expect( restoreButton.prop( 'disabled' ) ).toEqual( true );
	} );

	test( "enables the download button when 'rewindId' is provided'", () => {
		const wrapper = render( <ActionButtons rewindId="test" /> );
		const downloadButton = wrapper.find( '.daily-backup-status__download-button' ).hostNodes();

		expect( downloadButton.prop( 'href' ) ).toBeTruthy();
		expect( downloadButton.prop( 'disabled' ) ).toBeFalsy();
	} );

	test( 'enables the restore button when credentials are not needed', () => {
		getDoesRewindNeedCredentials.mockImplementation( () => false );

		const wrapper = render( <ActionButtons rewindId="test" /> );
		const restoreButton = wrapper.find( '.daily-backup-status__restore-button' ).hostNodes();

		expect( restoreButton.prop( 'href' ) ).toBeTruthy();
		expect( restoreButton.prop( 'disabled' ) ).toBeFalsy();
	} );

	test( 'disables the restore button when credentials are needed', () => {
		getDoesRewindNeedCredentials.mockImplementation( () => true );

		const wrapper = render( <ActionButtons rewindId="test" /> );
		const restoreButton = wrapper.find( '.daily-backup-status__restore-button' ).hostNodes();

		expect( restoreButton.prop( 'disabled' ) ).toEqual( true );
	} );

	test( 'emits a Tracks event when the download button is enabled and clicked', () => {
		const rewindId = 'test';
		const wrapper = render( <ActionButtons rewindId={ rewindId } /> );
		const downloadButton = wrapper.find( '.daily-backup-status__download-button' ).hostNodes();

		downloadButton.simulate( 'click' );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_jetpack_backup_download', {
			rewind_id: rewindId,
		} );
	} );

	test( 'emits a Tracks event when the restore button is enabled and clicked', () => {
		getDoesRewindNeedCredentials.mockImplementation( () => false );
		const rewindId = 'test';
		const wrapper = render( <ActionButtons rewindId={ rewindId } /> );

		const restoreButton = wrapper.find( '.daily-backup-status__restore-button' ).hostNodes();
		restoreButton.simulate( 'click' );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_jetpack_backup_restore', {
			rewind_id: rewindId,
		} );
	} );
} );
