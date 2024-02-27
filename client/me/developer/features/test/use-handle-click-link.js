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

	describe( 'ensure track events are recorded without the /support/ prefix', () => {
		test.each( [
			[ 'https://wordpress.com/support/feature', 'feature' ],
			[ 'https://wordpress.com/support/category/feature', 'category/feature' ],
			[ 'https://wordpress.com/support/feature-with-hyphens', 'feature-with-hyphens' ],
			[ 'https://wordpress.com/support/supported/feature', 'supported/feature' ],
		] )(
			"for the URL %s a tracks event is recorded using the 'feature' value '%s'",
			( href, feature ) => {
				const { result } = renderHook( () => useHandleClickLink() );
				const event = { currentTarget: { href } };

				act( () => result.current( event ) );

				expect( mockRecordTracksEventWithUserIsDevAccount ).toHaveBeenCalledWith( tracksHandle, {
					feature,
				} );
			}
		);
	} );
} );
