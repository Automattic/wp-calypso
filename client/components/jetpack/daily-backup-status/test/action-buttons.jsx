/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as record from 'calypso/state/analytics/actions/record';
import { areJetpackCredentialsInvalid } from 'calypso/state/jetpack/credentials/selectors';
import getDoesRewindNeedCredentials from 'calypso/state/selectors/get-does-rewind-need-credentials';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { renderWithProvider as render } from 'calypso/test-helpers/testing-library';
import ActionButtons from '../action-buttons';

jest.mock( 'calypso/state/ui/selectors' );
jest.mock( 'calypso/state/selectors/get-does-rewind-need-credentials' );
jest.mock( 'calypso/state/jetpack/credentials/selectors' );

const recordTracksEvent = jest.spyOn( record, 'recordTracksEvent' );

describe( 'ActionButtons', () => {
	beforeAll( () => {
		getSelectedSiteId.mockImplementation( () => 0 );
		getSelectedSiteSlug.mockImplementation( () => '' );
	} );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( "disables all buttons when 'rewindId' is not provided", () => {
		render( <ActionButtons /> );
		const downloadButton = screen.getByRole( 'button', { name: /download/i } );
		const restoreButton = screen.getByRole( 'button', { name: /restore/i } );

		expect( downloadButton ).toBeDisabled();
		expect( restoreButton ).toBeDisabled();
	} );

	test( "disables all buttons when 'disabled' is true", () => {
		render( <ActionButtons disabled rewindId="test" /> );
		const downloadButton = screen.getByRole( 'button', { name: /download/i } );
		const restoreButton = screen.getByRole( 'button', { name: /restore/i } );

		expect( downloadButton ).toBeDisabled();
		expect( restoreButton ).toBeDisabled();
	} );

	test( "enables the download button when 'rewindId' is provided'", () => {
		const rewindId = 'test';
		render( <ActionButtons rewindId={ rewindId } /> );
		const downloadButton = screen.getByRole( 'link', { name: /download/i } );

		expect( downloadButton ).toHaveAttribute(
			'href',
			expect.stringMatching( `/download/${ rewindId }` )
		);
		expect( downloadButton ).not.toBeDisabled();
	} );

	test( 'enables the restore button when credentials are not needed', () => {
		getDoesRewindNeedCredentials.mockImplementation( () => false );
		areJetpackCredentialsInvalid.mockImplementation( () => false );
		const rewindId = 'test';

		render( <ActionButtons rewindId={ rewindId } /> );
		const restoreButton = screen.getByRole( 'link', { name: /restore/i } );

		expect( restoreButton ).toHaveAttribute(
			'href',
			expect.stringMatching( `/restore/${ rewindId }` )
		);
		expect( restoreButton ).not.toBeDisabled();
	} );

	test( 'disables the restore button when credentials are needed', () => {
		getDoesRewindNeedCredentials.mockImplementation( () => true );
		areJetpackCredentialsInvalid.mockImplementation( () => true );

		render( <ActionButtons rewindId="test" /> );
		const restoreButton = screen.getByRole( 'button', { name: /restore/i } );

		expect( restoreButton ).toBeDisabled();
	} );

	test( 'emits a Tracks event when the download button is enabled and clicked', async () => {
		const user = userEvent.setup();
		const rewindId = 'test';
		render( <ActionButtons rewindId={ rewindId } /> );
		const downloadButton = screen.getByRole( 'link', { name: /download/i } );
		downloadButton.onclick = jest.fn( ( event ) => event.preventDefault() );

		await user.click( downloadButton );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_jetpack_backup_download', {
			rewind_id: rewindId,
		} );
	} );

	test( 'emits a Tracks event when the restore button is enabled and clicked', async () => {
		const user = userEvent.setup();
		getDoesRewindNeedCredentials.mockImplementation( () => false );
		areJetpackCredentialsInvalid.mockImplementation( () => false );
		const rewindId = 'test';
		render( <ActionButtons rewindId={ rewindId } /> );

		const restoreButton = screen.getByRole( 'link', { name: /restore/i } );
		restoreButton.onclick = jest.fn( ( event ) => event.preventDefault() );

		await user.click( restoreButton );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_jetpack_backup_restore', {
			rewind_id: rewindId,
		} );
	} );

	test( 'enables clone button', async () => {
		const user = userEvent.setup();
		const rewindId = 'test';
		const onClickClone = jest.fn();
		render(
			<ActionButtons
				rewindId={ rewindId }
				availableActions={ [ 'clone' ] }
				onClickClone={ onClickClone }
			/>
		);

		const linkElements = screen.getAllByRole( 'button' );
		const cloneButton = linkElements.find( ( link ) =>
			link.classList.contains( 'daily-backup-status__clone-button' )
		);

		await user.click( cloneButton );

		expect( onClickClone ).toHaveBeenCalledTimes( 1 );
		expect( onClickClone ).toHaveBeenCalledWith( rewindId );
	} );
} );
