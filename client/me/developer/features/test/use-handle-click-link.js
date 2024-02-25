/**
 * @jest-environment jsdom
 */

/* eslint-disable jest/no-conditional-expect */

import { act, renderHook } from '@testing-library/react';
import { useFeaturesList } from '../use-features-list';
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

	test( 'ensure useHandleClickLink handles support links as expected', () => {
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

	test( 'ensure analytics are correct for each support link in useFeaturesList', () => {
		const { result } = renderHook( () => useHandleClickLink() );
		const { result: featuresResult } = renderHook( () => useFeaturesList() );

		featuresResult.current.forEach( ( feature ) => {
			if ( feature.linkLearnMore ) {
				const event = {
					currentTarget: {
						href: feature.linkLearnMore,
					},
				};

				act( () => {
					result.current( event );
				} );

				// Logic from useHandleClickLink to extract the slug
				const prefixToRemove = '/support/';
				const pathIndex = event.currentTarget.href.indexOf( prefixToRemove );
				let expectedSlug = event.currentTarget.href;
				if ( pathIndex !== -1 ) {
					expectedSlug = expectedSlug.substring( pathIndex + prefixToRemove.length );
				}
				expectedSlug = expectedSlug.replace( /^\/|\/$/g, '' );

				expect( mockRecordTracksEventWithUserIsDevAccount ).toHaveBeenCalledWith( tracksHandle, {
					feature: expectedSlug,
				} );
			}
		} );
	} );
} );
