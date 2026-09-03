/**
 * @jest-environment jsdom
 */

let mockCurrentPostId: number | string | null = 1;

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( mapSelect: ( s: unknown ) => unknown ) =>
		mapSelect( ( store: string ) =>
			store === 'core/editor' ? { getCurrentPostId: () => mockCurrentPostId } : {}
		),
} ) );

import { renderHook } from '@testing-library/react';
import {
	getCurrentEditorPostIdFromStore,
	normalizeEditorPostId,
	useReviewPostContext,
} from './review-post-context';

type WpDataWindow = Window & {
	wp?: { data?: { select?: ( store: string ) => unknown } };
};

describe( 'normalizeEditorPostId', () => {
	it( 'accepts positive numbers and non-blank strings only', () => {
		expect( normalizeEditorPostId( 7 ) ).toBe( 7 );
		expect( normalizeEditorPostId( 'abc' ) ).toBe( 'abc' );
		expect( normalizeEditorPostId( 0 ) ).toBeUndefined();
		expect( normalizeEditorPostId( -2 ) ).toBeUndefined();
		expect( normalizeEditorPostId( '   ' ) ).toBeUndefined();
		expect( normalizeEditorPostId( null ) ).toBeUndefined();
		expect( normalizeEditorPostId( undefined ) ).toBeUndefined();
	} );
} );

describe( 'getCurrentEditorPostIdFromStore', () => {
	afterEach( () => {
		delete ( window as WpDataWindow ).wp;
	} );

	it( 'reads the live post ID from the wp.data global', () => {
		( window as WpDataWindow ).wp = {
			data: { select: () => ( { getCurrentPostId: () => 42 } ) },
		};
		expect( getCurrentEditorPostIdFromStore() ).toBe( 42 );
	} );

	it( 'returns undefined when the global is absent', () => {
		expect( getCurrentEditorPostIdFromStore() ).toBeUndefined();
	} );

	it( 'returns undefined when the store read throws', () => {
		( window as WpDataWindow ).wp = {
			data: {
				select: () => {
					throw new Error( 'unavailable' );
				},
			},
		};
		expect( getCurrentEditorPostIdFromStore() ).toBeUndefined();
	} );
} );

describe( 'useReviewPostContext', () => {
	afterEach( () => {
		delete ( window as WpDataWindow ).wp;
		mockCurrentPostId = 1;
	} );

	it( 'is fresh while the editor still shows the reviewed post', () => {
		const { result } = renderHook( () => useReviewPostContext( 1 ) );
		expect( result.current.isPostStale ).toBe( false );
		expect( result.current.isLatestPostContextStale() ).toBe( false );
	} );

	it( 'is stale for another post or a missing post ID', () => {
		expect( renderHook( () => useReviewPostContext( 2 ) ).result.current.isPostStale ).toBe( true );
		expect( renderHook( () => useReviewPostContext() ).result.current.isPostStale ).toBe( true );
	} );

	it( 'observes navigation at call time through the live store', () => {
		( window as WpDataWindow ).wp = {
			data: { select: () => ( { getCurrentPostId: () => 2 } ) },
		};
		const { result } = renderHook( () => useReviewPostContext( 1 ) );
		// Render-time state still matches, but the live store moved on.
		expect( result.current.isPostStale ).toBe( false );
		expect( result.current.isLatestPostContextStale() ).toBe( true );
	} );
} );
