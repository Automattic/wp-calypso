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

	describe( 'ensure track events report correct property', () => {
		it( 'should report element id when defined', () => {
			const { result } = renderHook( () => useHandleClickLink() );
			const elementId = 'my-feature';
			const event = { currentTarget: { id: elementId } };

			act( () => result.current( event ) );

			expect( mockRecordTracksEventWithUserIsDevAccount ).toHaveBeenCalledWith( tracksHandle, {
				feature: elementId,
			} );
		} );

		it( 'should report href when element id is not defined', () => {
			const { result } = renderHook( () => useHandleClickLink() );
			const href = 'https://wordpress.com';
			const event = { currentTarget: { href } };

			act( () => result.current( event ) );

			expect( mockRecordTracksEventWithUserIsDevAccount ).toHaveBeenCalledWith( tracksHandle, {
				feature: href,
			} );
		} );
	} );
} );
