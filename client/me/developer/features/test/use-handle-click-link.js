/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useHandleClickLink } from '../use-handle-click-link';

jest.mock( 'react-redux', () => ( {
	useDispatch: jest.fn(),
} ) );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

describe( 'useHandleClickLink', () => {
	const tracksHandle = 'calypso_me_developer_learn_more';

	beforeAll( () => {
		useDispatch.mockReturnValue( jest.fn() );
	} );

	describe( 'ensure track events report correct property', () => {
		it( 'should report element id when defined', () => {
			const { result } = renderHook( () => useHandleClickLink() );
			const elementId = 'my-feature';
			const event = { currentTarget: { id: elementId } };

			act( () => result.current( event ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith( tracksHandle, {
				feature: elementId,
			} );
		} );

		it( 'should report href when element id is not defined', () => {
			const { result } = renderHook( () => useHandleClickLink() );
			const href = 'https://wordpress.com';
			const event = { currentTarget: { href } };

			act( () => result.current( event ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith( tracksHandle, {
				feature: href,
			} );
		} );
	} );
} );
