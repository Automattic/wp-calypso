/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { ComposerProvider, useComposer } from '../composer-provider';

const wrap = ( connectionId: number ) =>
	function Wrapper( { children }: { children: React.ReactNode } ) {
		return <ComposerProvider connectionId={ connectionId }>{ children }</ComposerProvider>;
	};

describe( 'useComposer', () => {
	it( 'starts with mode = null', () => {
		const { result } = renderHook( () => useComposer(), { wrapper: wrap( 42 ) } );
		expect( result.current.mode ).toBeNull();
	} );

	it( 'openComposer sets mode + connectionId; closeComposer clears it', () => {
		const { result } = renderHook( () => useComposer(), { wrapper: wrap( 42 ) } );
		act( () => {
			result.current.openComposer( {
				kind: 'reply',
				root: { uri: 'at://r', cid: 'rcid' },
				parent: { uri: 'at://p', cid: 'pcid' },
				previewPost: makePreview( 'at://p' ),
			} );
		} );
		expect( result.current.mode ).toMatchObject( {
			kind: 'reply',
			connectionId: 42,
			root: { uri: 'at://r', cid: 'rcid' },
		} );
		act( () => result.current.closeComposer() );
		expect( result.current.mode ).toBeNull();
	} );

	it( 'snapshots connectionId at open time and ignores later prop changes', () => {
		const { result, rerender } = renderHook( () => useComposer(), { wrapper: wrap( 42 ) } );
		act( () =>
			result.current.openComposer( {
				kind: 'reply',
				root: { uri: 'at://r', cid: 'rcid' },
				parent: { uri: 'at://p', cid: 'pcid' },
				previewPost: makePreview( 'at://p' ),
			} )
		);
		rerender( { wrapper: wrap( 99 ) } as never );
		expect( result.current.mode?.connectionId ).toBe( 42 );
	} );

	it( 'throws if useComposer is called outside ComposerProvider', () => {
		expect( () => renderHook( () => useComposer() ) ).toThrow();
	} );
} );

function makePreview( uri: string ) {
	return {
		uri,
		cid: 'c',
		author: { did: 'did:plc:x', handle: 'h', display_name: 'd', avatar: null },
		text: 't',
		html: '<p>t</p>',
	};
}
