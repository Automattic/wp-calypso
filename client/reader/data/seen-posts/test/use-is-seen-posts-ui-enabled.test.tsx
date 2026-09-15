/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useIsSeenPostsUiEnabled } from '../use-is-seen-posts-ui-enabled';

let mockIsAvailable = true;
let mockIsPreferenceEnabled = true;

jest.mock( '../use-is-seen-posts-available', () => ( {
	useIsSeenPostsAvailable: () => mockIsAvailable,
} ) );

jest.mock( '../use-seen-posts-preference-enabled', () => ( {
	useSeenPostsPreferenceEnabled: () => mockIsPreferenceEnabled,
} ) );

describe( 'useIsSeenPostsUiEnabled', () => {
	beforeEach( () => {
		mockIsAvailable = true;
		mockIsPreferenceEnabled = true;
	} );

	test( 'returns true when available and preference enabled', () => {
		const { result } = renderHook( () => useIsSeenPostsUiEnabled() );
		expect( result.current ).toBe( true );
	} );

	test( 'returns false when the feature is not available', () => {
		mockIsAvailable = false;
		const { result } = renderHook( () => useIsSeenPostsUiEnabled() );
		expect( result.current ).toBe( false );
	} );

	test( 'returns false when the preference is disabled', () => {
		mockIsPreferenceEnabled = false;
		const { result } = renderHook( () => useIsSeenPostsUiEnabled() );
		expect( result.current ).toBe( false );
	} );
} );
