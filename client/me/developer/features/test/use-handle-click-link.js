/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useHandleClickLink } from '../use-handle-click-link';
import { useRecordTracksEventWithUserIsDevAccount } from '../use-record-tracks-event-with-user-is-dev-account';

jest.mock( '../use-record-tracks-event-with-user-is-dev-account', () => ( {
	useRecordTracksEventWithUserIsDevAccount: jest.fn(),
} ) );

describe( 'useHandleClickLink', () => {
	let mockRecordTracksEventWithUserIsDevAccount;

	const tracksHandle = 'calypso_me_developer_learn_more';

	beforeAll( () => {
		mockRecordTracksEventWithUserIsDevAccount = jest.fn();
		useRecordTracksEventWithUserIsDevAccount.mockReturnValue(
			mockRecordTracksEventWithUserIsDevAccount
		);
	} );

	test( 'should ensure analytics are correct for support links', () => {
		const { result } = renderHook( () => useHandleClickLink() );

		const event = {
			currentTarget: {
				href: 'https://wordpress.com/support/connect-to-ssh-on-wordpress-com',
			},
		};

		act( () => {
			result.current( event );
		} );

		expect( mockRecordTracksEventWithUserIsDevAccount ).toHaveBeenCalledWith( tracksHandle, {
			feature: 'connect-to-ssh-on-wordpress-com',
		} );
	} );

	test( 'should ensure analytics are correct for support links with different structures', () => {
		const { result } = renderHook( () => useHandleClickLink() );

		const event = {
			currentTarget: {
				href: 'https://wordpress.com/support/domains/https-ssl/',
			},
		};

		act( () => {
			result.current( event );
		} );

		expect( mockRecordTracksEventWithUserIsDevAccount ).toHaveBeenCalledWith( tracksHandle, {
			feature: 'domains/https-ssl',
		} );
	} );
} );
