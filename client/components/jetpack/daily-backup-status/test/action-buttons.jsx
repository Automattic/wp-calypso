/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as record from 'calypso/state/analytics/actions/record';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import ActionButtons from '../action-buttons';

jest.mock( 'calypso/state/ui/selectors' );
jest.mock( 'calypso/state/selectors/get-does-rewind-need-credentials' );

const recordTracksEvent = jest.spyOn( record, 'recordTracksEvent' );

function renderWithRedux( ui ) {
	return renderWithProvider( ui, {
		initialState: {},
	} );
}

describe( 'ActionButtons', () => {
	beforeAll( () => {
		getSelectedSiteId.mockImplementation( () => 0 );
		getSelectedSiteSlug.mockImplementation( () => '' );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( "disables all buttons when 'rewindId' is not provided", async () => {
		renderWithRedux( <ActionButtons /> );

		expect( screen.getByText( 'Download backup' ) ).toHaveAttribute( 'disabled' );
		expect( screen.getByText( 'Restore to this point' ) ).toHaveAttribute( 'disabled' );
	} );

	test( "disables all buttons when 'disabled' is true", async () => {
		renderWithRedux( <ActionButtons disabled rewindId="test" /> );

		expect( screen.getByText( 'Download backup' ) ).toHaveAttribute( 'disabled' );
		expect( screen.getByText( 'Restore to this point' ) ).toHaveAttribute( 'disabled' );
	} );

	test( "enables the download button when 'rewindId' is provided'", async () => {
		renderWithRedux( <ActionButtons rewindId="test" /> );

		expect( screen.getByText( 'Download backup' ) ).not.toHaveAttribute( 'disabled' );
		expect( screen.getByText( 'Download backup' ) ).toHaveAttribute( 'href' );
	} );

	test( 'enables the restore button when credentials are not needed', async () => {
		getDoesRewindNeedCredentials.mockImplementation( () => false );

		renderWithRedux( <ActionButtons rewindId="test" /> );

		expect( screen.getByText( 'Restore to this point' ) ).toHaveAttribute( 'href' );
		expect( screen.getByText( 'Restore to this point' ) ).not.toHaveAttribute( 'disabled' );
	} );

	test( 'disables the restore button when credentials are needed', async () => {
		getDoesRewindNeedCredentials.mockImplementation( () => true );

		renderWithRedux( <ActionButtons rewindId="test" /> );

		expect( screen.getByText( 'Restore to this point' ) ).toHaveAttribute( 'disabled' );
	} );

	test( 'emits a Tracks event when the download button is enabled and clicked', async () => {
		const user = userEvent.setup();
		const rewindId = 'test';
		renderWithRedux( <ActionButtons rewindId={ rewindId } /> );

		await user.click( screen.getByText( 'Download backup' ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_jetpack_backup_download', {
			rewind_id: rewindId,
		} );
	} );

	test( 'emits a Tracks event when the restore button is enabled and clicked', async () => {
		const user = userEvent.setup();

		getDoesRewindNeedCredentials.mockImplementation( () => false );
		const rewindId = 'test';
		renderWithRedux( <ActionButtons rewindId={ rewindId } /> );

		await user.click( screen.getByText( 'Restore to this point' ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_jetpack_backup_restore', {
			rewind_id: rewindId,
		} );
	} );
} );
