/**
 * @jest-environment jsdom
 */
import { act } from '@testing-library/react';
import { renderHookWithProvider } from 'calypso/test-helpers/testing-library';
import { useAtmosphereInteractionSettings } from '../use-atmosphere-interaction-settings';
import type { ActiveMode } from 'calypso/reader/social/composer';

const STANDALONE_MODE: ActiveMode = {
	kind: 'standalone',
	connectionId: 7,
	entry_point: 'fab',
};

const REPLY_MODE = {
	kind: 'reply',
	connectionId: 7,
	root: { uri: 'at://root', cid: 'cid' },
	parent: { uri: 'at://parent', cid: 'cid' },
	previewPost: { author: { handle: 'a.bsky.social' } },
} as unknown as ActiveMode;

describe( 'useAtmosphereInteractionSettings', () => {
	it( 'returns null trigger for non-standalone modes', () => {
		const { result } = renderHookWithProvider( () =>
			useAtmosphereInteractionSettings( { mode: REPLY_MODE, connectionId: 7 } )
		);
		expect( result.current.renderTrigger!() ).toBeNull();
	} );

	it( 'returns a non-null trigger for standalone mode', () => {
		const { result } = renderHookWithProvider( () =>
			useAtmosphereInteractionSettings( { mode: STANDALONE_MODE, connectionId: 7 } )
		);
		expect( result.current.renderTrigger!() ).not.toBeNull();
	} );

	it( 'extendBuildParams adds nothing when state is default', () => {
		const { result } = renderHookWithProvider( () =>
			useAtmosphereInteractionSettings( { mode: STANDALONE_MODE, connectionId: 7 } )
		);
		const out = result.current.extendBuildParams( { connectionId: 7, text: 'Hi' } );
		expect( out ).toEqual( { connectionId: 7, text: 'Hi' } );
	} );

	it( 'extendBuildParams adds nothing when mode is reply', () => {
		const { result } = renderHookWithProvider( () =>
			useAtmosphereInteractionSettings( { mode: REPLY_MODE, connectionId: 7 } )
		);
		const out = result.current.extendBuildParams( { connectionId: 7, text: 'Hi' } );
		expect( out ).toEqual( { connectionId: 7, text: 'Hi' } );
	} );

	it( 'extendBuildParams adds interaction_settings when state is non-default', () => {
		const { result } = renderHookWithProvider( () =>
			useAtmosphereInteractionSettings( { mode: STANDALONE_MODE, connectionId: 7 } )
		);
		act( () => {
			result.current.__test__setReplyAllow!( { kind: 'nobody' } );
			result.current.__test__setAllowQuotes!( false );
		} );
		expect( result.current.extendBuildParams( { connectionId: 7, text: 'Hi' } ) ).toEqual( {
			connectionId: 7,
			text: 'Hi',
			interaction_settings: {
				reply_allow: { kind: 'nobody' },
				allow_quotes: false,
			},
		} );
	} );

	it( 'clear() resets state to defaults', () => {
		const { result } = renderHookWithProvider( () =>
			useAtmosphereInteractionSettings( { mode: STANDALONE_MODE, connectionId: 7 } )
		);
		act( () => {
			result.current.__test__setReplyAllow!( { kind: 'nobody' } );
			result.current.__test__setAllowQuotes!( false );
		} );
		act( () => {
			result.current.clear?.();
		} );
		expect( result.current.extendBuildParams( { connectionId: 7, text: 'Hi' } ) ).toEqual( {
			connectionId: 7,
			text: 'Hi',
		} );
	} );

	it( 'getTracksProps reflects current non-default state', () => {
		const { result } = renderHookWithProvider( () =>
			useAtmosphereInteractionSettings( { mode: STANDALONE_MODE, connectionId: 7 } )
		);
		expect( result.current.getTracksProps?.() ).toEqual( {} );

		act( () => {
			result.current.__test__setReplyAllow!( { kind: 'nobody' } );
		} );
		expect( result.current.getTracksProps?.() ).toEqual( { reply_allow_kind: 'nobody' } );
	} );

	it( 'getTracksProps returns {} for non-standalone mode even with non-default state', () => {
		const { result } = renderHookWithProvider( () =>
			useAtmosphereInteractionSettings( { mode: REPLY_MODE, connectionId: 7 } )
		);
		act( () => {
			result.current.__test__setReplyAllow!( { kind: 'nobody' } );
		} );
		expect( result.current.getTracksProps?.() ).toEqual( {} );
	} );
} );
