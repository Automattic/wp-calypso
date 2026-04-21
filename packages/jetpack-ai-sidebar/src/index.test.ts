/**
 * Tests for the Jetpack AI Sidebar provider.
 *
 * Focused on the show-component flow, the checkpoint hook, and the
 * getChatComponent resolver — these are the pieces AM wires into its chat.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import TitlePicker from './components/title-picker';
import { getChatComponent, toolProvider, useCheckpoint } from './index';

// Stub @wordpress/data on window so useCheckpoint / handleShowComponent
// can read/write the post title via the core/editor store.
function installWpDataMock( initialTitle: string ) {
	const state = { title: initialTitle };
	( window as any ).wp = {
		data: {
			select: ( store: string ) => {
				if ( store === 'core/editor' ) {
					return {
						getEditedPostAttribute: ( attr: string ) =>
							attr === 'title' ? state.title : undefined,
					};
				}
				return undefined;
			},
			dispatch: ( store: string ) => {
				if ( store === 'core/editor' ) {
					return {
						editPost: ( attrs: { title?: string } ) => {
							if ( typeof attrs.title === 'string' ) {
								state.title = attrs.title;
							}
						},
					};
				}
				return undefined;
			},
		},
	};
	return state;
}

describe( 'getChatComponent', () => {
	it( 'returns TitlePicker for type "title-picker"', () => {
		expect( getChatComponent( 'title-picker' ) ).toBe( TitlePicker );
	} );

	it( 'returns null for an unknown type', () => {
		expect( getChatComponent( 'font-picker' ) ).toBeNull();
		expect( getChatComponent( '' ) ).toBeNull();
		expect( getChatComponent( 'anything-else' ) ).toBeNull();
	} );
} );

describe( 'toolProvider', () => {
	beforeEach( () => {
		// Ensure wp.abilities is undefined so getAbilities falls into the
		// empty-base case and only includes the provider's own definitions.
		( window as any ).wp = {};
	} );

	describe( 'getAbilities', () => {
		it( 'includes update-block-content and big_sky__show_component', async () => {
			const abilities = await toolProvider.getAbilities();
			const names = abilities.map( ( a: any ) => a.name );

			expect( names ).toContain( 'wpcom/update-block-content' );
			expect( names ).toContain( 'big_sky__show_component' );
		} );

		it( 'wires a callback on each provided ability', async () => {
			const abilities = await toolProvider.getAbilities();
			const showComponent = abilities.find( ( a: any ) => a.name === 'big_sky__show_component' );
			const updateBlock = abilities.find( ( a: any ) => a.name === 'wpcom/update-block-content' );

			expect( typeof showComponent?.callback ).toBe( 'function' );
			expect( typeof updateBlock?.callback ).toBe( 'function' );
		} );
	} );

	describe( 'executeAbility for big_sky__show_component', () => {
		beforeEach( () => {
			installWpDataMock( 'Original Title' );
		} );

		it( 'returns an error when type is missing', async () => {
			const { result } = await toolProvider.executeAbility( 'big_sky__show_component', {} );
			expect( result ).toMatchObject( { success: false } );
			expect( ( result as any ).error ).toMatch( /missing type/ );
		} );

		it( 'returns an error for an unknown component type', async () => {
			const { result } = await toolProvider.executeAbility( 'big_sky__show_component', {
				type: 'nonexistent-picker',
				props: {},
			} );
			expect( result ).toMatchObject( { success: false } );
			expect( ( result as any ).error ).toMatch( /no component registered/ );
		} );

		it( 'returns an agentMessage envelope for a valid title-picker call', async () => {
			const titles = [
				{ title: 'Title 1', explanation: 'a' },
				{ title: 'Title 2', explanation: 'b' },
				{ title: 'Title 3', explanation: 'c' },
			];
			const { result, returnToAgent } = ( await toolProvider.executeAbility(
				'big_sky__show_component',
				{
					type: 'title-picker',
					props: { titles },
					toolCallId: 'call_test_123',
				}
			) ) as any;

			expect( returnToAgent ).toBe( false );
			expect( result.returnToAgent ).toBe( false );
			expect( typeof result.agentMessage ).toBe( 'string' );

			const parsed = JSON.parse( result.agentMessage );
			expect( parsed.tool_id ).toBe( 'big_sky__show_component' );
			expect( parsed.data.type ).toBe( 'title-picker' );
			expect( parsed.data.props ).toEqual( { titles } );
			expect( parsed.data.calypsoCheckpointId ).toBe( 'call_test_123' );
			expect( parsed.data.isCurrent ).toBe( true );
			expect( parsed.data.hideZoomAction ).toBe( true );
		} );

		it( 'generates a checkpointId fallback when toolCallId is missing', async () => {
			const { result } = ( await toolProvider.executeAbility( 'big_sky__show_component', {
				type: 'title-picker',
				props: { titles: [ { title: 'x' } ] },
			} ) ) as any;

			const parsed = JSON.parse( result.agentMessage );
			expect( typeof parsed.data.calypsoCheckpointId ).toBe( 'string' );
			expect( parsed.data.calypsoCheckpointId.length ).toBeGreaterThan( 0 );
		} );
	} );
} );

describe( 'useCheckpoint', () => {
	beforeEach( () => {
		installWpDataMock( 'Original Title' );
	} );

	it( 'snapshots the post title on setCheckpoint and restores it on restoreCheckpoint', async () => {
		const api = useCheckpoint();

		// Snapshot original.
		api.setCheckpoint( 'cp-1' );
		expect( api.hasCheckpoint( 'cp-1' ) ).toBe( true );

		// Change title.
		( window as any ).wp.data.dispatch( 'core/editor' ).editPost( { title: 'New Title' } );
		expect(
			( window as any ).wp.data.select( 'core/editor' ).getEditedPostAttribute( 'title' )
		).toBe( 'New Title' );

		// Restore.
		await api.restoreCheckpoint( 'cp-1' );
		expect(
			( window as any ).wp.data.select( 'core/editor' ).getEditedPostAttribute( 'title' )
		).toBe( 'Original Title' );
	} );

	it( 'keeps the checkpoint after restore so Undo can be used repeatedly', async () => {
		const api = useCheckpoint();
		api.setCheckpoint( 'cp-2' );

		( window as any ).wp.data.dispatch( 'core/editor' ).editPost( { title: 'Try 1' } );
		await api.restoreCheckpoint( 'cp-2' );
		expect( api.hasCheckpoint( 'cp-2' ) ).toBe( true );

		( window as any ).wp.data.dispatch( 'core/editor' ).editPost( { title: 'Try 2' } );
		await api.restoreCheckpoint( 'cp-2' );
		expect(
			( window as any ).wp.data.select( 'core/editor' ).getEditedPostAttribute( 'title' )
		).toBe( 'Original Title' );
	} );

	it( 'removes the checkpoint when clearCheckpoint is called', () => {
		const api = useCheckpoint();
		api.setCheckpoint( 'cp-3' );
		expect( api.hasCheckpoint( 'cp-3' ) ).toBe( true );
		api.clearCheckpoint( 'cp-3' );
		expect( api.hasCheckpoint( 'cp-3' ) ).toBe( false );
	} );

	it( 'hasCheckpoint returns false for unknown ids', () => {
		const api = useCheckpoint();
		expect( api.hasCheckpoint( 'never-set' ) ).toBe( false );
	} );
} );
