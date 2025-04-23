/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useNetworkConnection } from 'calypso/lib/network-connection';
import { useDispatch } from 'calypso/state';
import { warningNotice, successNotice, removeNotice } from 'calypso/state/notices/actions';
import OfflineStatus from '../';

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: jest.fn(),
} ) );

jest.mock( 'calypso/lib/network-connection', () => ( {
	useNetworkConnection: jest.fn().mockReturnValue( { isOnline: true } ),
} ) );

jest.mock( 'calypso/state', () => ( {
	useDispatch: jest.fn(),
} ) );

const mockUseTranslate = useTranslate as jest.Mock;
const mockUseNetworkConnection = useNetworkConnection as jest.Mock;
const mockUseDispatch = useDispatch as jest.Mock;

describe( 'OfflineStatus', () => {
	let mockDispatch: jest.Mock;

	beforeEach( () => {
		jest.clearAllMocks();
		mockDispatch = jest.fn();
		mockUseDispatch.mockReturnValue( mockDispatch );
		mockUseTranslate.mockReturnValue( ( string: string ) => string );
	} );

	afterEach( () => {
		jest.resetAllMocks();
	} );

	test( 'should not render anything when online', () => {
		mockUseNetworkConnection.mockReturnValue( { isOnline: true } );

		render( <OfflineStatus /> );

		expect( screen.queryByText( 'Offline' ) ).not.toBeInTheDocument();
	} );

	test( 'should render offline indicator when offline', () => {
		mockUseNetworkConnection.mockReturnValue( { isOnline: false } );

		render( <OfflineStatus /> );

		expect( screen.getByText( 'Offline' ) ).toBeInTheDocument();
	} );

	test( 'should dispatch warning notice when going offline', () => {
		mockUseNetworkConnection.mockReturnValue( { isOnline: true } );
		const { rerender } = render( <OfflineStatus /> );

		// Change to offline
		mockUseNetworkConnection.mockReturnValue( { isOnline: false } );
		rerender( <OfflineStatus /> );

		expect( mockDispatch ).toHaveBeenCalledWith( removeNotice( 'connectionRestored' ) );
		expect( mockDispatch ).toHaveBeenCalledWith(
			warningNotice( 'Not connected. Some information may be out of sync.', {
				showDismiss: true,
				isPersistent: true,
				id: 'connectionLost',
				duration: 5000,
			} )
		);
	} );

	test( 'should dispatch success notice when coming back online', () => {
		mockUseNetworkConnection.mockReturnValue( { isOnline: false } );
		const { rerender } = render( <OfflineStatus /> );

		// Change to online
		mockUseNetworkConnection.mockReturnValue( { isOnline: true } );
		rerender( <OfflineStatus /> );

		expect( mockDispatch ).toHaveBeenCalledWith( removeNotice( 'connectionLost' ) );
		expect( mockDispatch ).toHaveBeenCalledWith(
			successNotice( 'Connection restored.', {
				showDismiss: true,
				isPersistent: true,
				id: 'connectionRestored',
				duration: 5000,
			} )
		);
	} );

	test( 'should not dispatch notices if online status remains unchanged', () => {
		mockUseNetworkConnection.mockReturnValue( { isOnline: true } );
		const { rerender } = render( <OfflineStatus /> );

		// Rerender with the same online status
		rerender( <OfflineStatus /> );

		expect( mockDispatch ).not.toHaveBeenCalled();
	} );
} );
