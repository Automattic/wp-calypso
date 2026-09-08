/**
 * @jest-environment jsdom
 */
import { select } from '@wordpress/data';
import {
	bindToOpenCanvas,
	getBlockingMove,
	getCanvasMove,
	startNewUserRequest,
} from '../canvas-binding';
import { withCanvasBinding, withCanvasGuard } from '../canvas-guard';
import type { ClientContextType, ToolProvider } from '../../types';

jest.mock( '@wordpress/data', () => ( { select: jest.fn() } ) );

const mockSelect = select as jest.MockedFunction< typeof select >;

/**
 * Point the mocked `core/editor` store at a given post.
 * @param post The post the editor is treated as having open, or null for no store.
 */
function setOpenPost( post: { id?: number | string; type?: string; title?: string } | null ) {
	mockSelect.mockImplementation( ( storeName ) => {
		if ( storeName !== 'core/editor' || ! post ) {
			return undefined as never;
		}
		return {
			getCurrentPostId: () => post.id,
			getCurrentPostType: () => post.type,
			getEditedPostAttribute: ( attribute: string ) =>
				attribute === 'title' ? post.title : undefined,
		} as never;
	} );
}

function createToolProvider( executeAbility = jest.fn() ): ToolProvider {
	return {
		getAbilities: jest.fn( () => Promise.resolve( [] ) ),
		executeAbility,
	} as unknown as ToolProvider;
}

function createClientContext( overrides: Partial< ClientContextType > = {} ): ClientContextType {
	return {
		url: 'https://example.com/wp-admin/site-editor.php',
		pathname: '/wp-admin/site-editor.php',
		search: '',
		environment: 'wp-admin',
		...overrides,
	};
}

const ABOUT_PAGE = { id: 12, type: 'page', title: 'About' };
const CONTACT_PAGE = { id: 34, type: 'page', title: 'Contact' };

describe( 'withCanvasGuard', () => {
	beforeEach( () => {
		mockSelect.mockReset();
		startNewUserRequest();
	} );

	it( 'refuses a canvas write once the canvas has moved', async () => {
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();
		setOpenPost( CONTACT_PAGE );

		const executeAbility = jest.fn();
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		const result = await guarded!.executeAbility( 'big_sky__apply_block_edits', {} );

		expect( executeAbility ).not.toHaveBeenCalled();
		expect( result ).toMatchObject( {
			returnToAgent: true,
			result: { success: false, error: 'editor_canvas_moved' },
		} );
		// Both pages named, so the model can tell the user what happened without
		// another round trip.
		expect( result.result.message ).toContain( 'About' );
		expect( result.result.message ).toContain( 'Contact' );
	} );

	it( 'matches the registered ability name as well as the agent-normalized one', async () => {
		// The agent invokes `big-sky/stream-page-design` as
		// `big_sky__stream_page_design`; matching only one form leaves the guard
		// inert for the other.
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();
		setOpenPost( CONTACT_PAGE );

		const executeAbility = jest.fn();
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		await guarded!.executeAbility( 'big-sky/stream-page-design', {} );

		expect( executeAbility ).not.toHaveBeenCalled();
	} );

	it( 'refuses a canvas write when the editor has no page open at all', async () => {
		// The looping case: page-design polls for a canvas to appear, so letting this
		// through leaves the agent retrying against a page that is never coming back.
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();
		setOpenPost( null );

		const executeAbility = jest.fn();
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		const result = await guarded!.executeAbility( 'big_sky__stream_page_design', {} );

		expect( executeAbility ).not.toHaveBeenCalled();
		expect( result.result.error ).toBe( 'editor_canvas_closed' );
		expect( result.result.message ).toContain( 'About' );
		// The model is told not to route around the refusal, which is what keeps a
		// doomed request from being kept alive by a different tool.
		expect( result.result.message ).toContain( 'another way' );
	} );

	it( 'still allows a write while the canvas mounts after the agent navigates', async () => {
		// `editor-navigate` clears the binding, so the mount that follows is
		// unguarded and the ability's own readiness retry does its job.
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();

		const executeAbility = jest.fn().mockResolvedValue( { ok: true } );
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		await guarded!.executeAbility( 'big_sky__editor_navigate', {} );
		setOpenPost( null );
		await guarded!.executeAbility( 'big_sky__stream_page_design', {} );

		expect( executeAbility ).toHaveBeenCalledWith( 'big_sky__stream_page_design', {} );
	} );

	it( 'guards restore-checkpoint too', async () => {
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();
		setOpenPost( CONTACT_PAGE );

		const executeAbility = jest.fn();
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		await guarded!.executeAbility( 'big_sky__restore_checkpoint', {} );

		expect( executeAbility ).not.toHaveBeenCalled();
	} );

	it( 'keeps refusing for the rest of the request once blocked', async () => {
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();
		setOpenPost( CONTACT_PAGE );

		const executeAbility = jest.fn();
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		await guarded!.executeAbility( 'big_sky__apply_block_edits', {} );
		// The refused call's continuation rebinds to the page now open, so the live
		// reading agrees again — but the request stays refused.
		bindToOpenCanvas();
		const result = await guarded!.executeAbility( 'big_sky__apply_block_edits', {} );

		expect( executeAbility ).not.toHaveBeenCalled();
		expect( result.result.message ).toContain( 'About' );
	} );

	it( 'lets a canvas write through while the canvas has not moved', async () => {
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();

		const executeAbility = jest.fn().mockResolvedValue( { ok: true } );
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		await expect(
			guarded!.executeAbility( 'big_sky__apply_block_edits', { edits: [] } )
		).resolves.toEqual( { ok: true } );
		expect( executeAbility ).toHaveBeenCalledWith( 'big_sky__apply_block_edits', { edits: [] } );
	} );

	it( 'lets an unguarded ability through even when the canvas has moved', async () => {
		// `edit-entity-record` names its own target (`entityType`/`recordId`, often
		// site-level like `root`/`site` or `wp_navigation`), so moving the canvas
		// cannot redirect its write. Guarding it would refuse legitimate site-level
		// edits.
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();
		setOpenPost( CONTACT_PAGE );

		const executeAbility = jest.fn().mockResolvedValue( { ok: true } );
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		await guarded!.executeAbility( 'big_sky__edit_entity_record', {} );

		expect( executeAbility ).toHaveBeenCalled();
	} );

	it( 'drops the binding before an ability whose job is to move the canvas', async () => {
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();

		const executeAbility = jest.fn().mockImplementation( async () => {
			setOpenPost( CONTACT_PAGE );
			return { ok: true };
		} );
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		await guarded!.executeAbility( 'big_sky__editor_navigate', {} );

		// The agent's own navigation must not read as a move on the next write.
		expect( getCanvasMove() ).toBeNull();
	} );

	it( 'holds the destination while the navigation is still in flight', async () => {
		// The gap a bare `clearCanvasBinding()` leaves. agenttic-client re-requests
		// client context when it sends a tool result, so the navigate result rebinds
		// before the editor has opened the page — and a page the server only just
		// created is never in the store yet, so the editor still reports the old one.
		// Binding to the destination up front is what stops that rebind latching the
		// page the user is leaving and aborting the agent's own navigation.
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();

		const executeAbility = jest.fn().mockResolvedValue( { ok: true } );
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		// `add-page` created page 34 server-side and asked the client to open it.
		await guarded!.executeAbility( 'big_sky__editor_navigate', { path: '/page/34' } );

		// The tool result goes out while the editor is still showing About.
		bindToOpenCanvas();

		// The editor arrives at the new page.
		setOpenPost( CONTACT_PAGE );

		expect( getCanvasMove() ).toBeNull();
	} );

	it( 'catches the user leaving once the navigation has landed', async () => {
		// The binding must not stay pinned to the destination forever: once the
		// editor arrives, an ordinary user navigation is a move again.
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();

		const executeAbility = jest.fn().mockResolvedValue( { ok: true } );
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		await guarded!.executeAbility( 'big_sky__editor_navigate', { path: '/page/34' } );
		setOpenPost( CONTACT_PAGE );
		bindToOpenCanvas();

		setOpenPost( ABOUT_PAGE );

		expect( getCanvasMove() ).toEqual( { from: 'Contact', to: 'About' } );
	} );

	it( 'puts the binding back when a navigation reports failure', async () => {
		// `editor-navigate` can answer `{ success: false }` without ever moving — a
		// save conflict, a stale page id, a network error. A destination left bound
		// for a trip that never started suppresses every move reading until the
		// editor reaches a page it is not going to reach.
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();

		const executeAbility = jest
			.fn()
			.mockResolvedValue( { result: { success: false, message: 'Could not open that page.' } } );
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		await guarded!.executeAbility( 'big_sky__editor_navigate', { path: '/page/34' } );

		// The editor never left About, and then the user does.
		setOpenPost( CONTACT_PAGE );

		expect( getCanvasMove() ).toEqual( { from: 'About', to: 'Contact' } );
	} );

	it( 'puts the binding back when a navigation throws', async () => {
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();

		const executeAbility = jest.fn().mockRejectedValue( new Error( 'Network error' ) );
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		// The failure still reaches the caller: the guard restores the binding, it
		// does not swallow the error.
		await expect(
			guarded!.executeAbility( 'big_sky__editor_navigate', { path: '/page/34' } )
		).rejects.toThrow( 'Network error' );

		setOpenPost( CONTACT_PAGE );

		expect( getCanvasMove() ).toEqual( { from: 'About', to: 'Contact' } );
	} );

	it( 'keeps guarding later writes in a turn whose navigation failed', async () => {
		// What the stuck destination cost: the write that follows a failed
		// navigation is the one that lands on the page the user moved to.
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();

		const executeAbility = jest.fn().mockResolvedValue( { result: { success: false } } );
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		await guarded!.executeAbility( 'big_sky__editor_navigate', { path: '/page/34' } );
		setOpenPost( CONTACT_PAGE );
		const result = await guarded!.executeAbility( 'big_sky__apply_block_edits', {} );

		expect( executeAbility ).toHaveBeenCalledTimes( 1 );
		expect( result.result.error ).toBe( 'editor_canvas_moved' );
	} );

	it( 'keeps the destination when a navigation reports failure after landing', async () => {
		// The editor got there. A failure reported on the way out does not make the
		// page now on screen the wrong one to write to.
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();

		const executeAbility = jest.fn().mockImplementation( async () => {
			setOpenPost( CONTACT_PAGE );
			return { result: { success: false } };
		} );
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		await guarded!.executeAbility( 'big_sky__editor_navigate', { path: '/page/34' } );

		expect( getCanvasMove() ).toBeNull();
	} );

	it( 'puts the binding back when a navigation with no readable destination fails', async () => {
		// The other branch: `wp-admin/navigate` names no canvas, so the binding is
		// dropped rather than moved — but a navigation that never happened has to
		// leave the guard exactly where it found it either way.
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();

		const executeAbility = jest.fn().mockResolvedValue( { result: { success: false } } );
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		await guarded!.executeAbility( 'wp_admin__navigate', { path: '/wp-admin/plugins.php' } );
		setOpenPost( CONTACT_PAGE );

		expect( getCanvasMove() ).toEqual( { from: 'About', to: 'Contact' } );
	} );

	it( 'falls back to dropping the binding when the destination cannot be read', async () => {
		// `wp-admin/navigate` takes a wp-admin path, not a canvas, and a malformed
		// editor path names no page either. Unbound is the safe answer: it cannot
		// pin the request to a page it guessed wrong.
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();

		const executeAbility = jest.fn().mockResolvedValue( { ok: true } );
		const guarded = withCanvasGuard( createToolProvider( executeAbility ) );

		await guarded!.executeAbility( 'wp_admin__navigate', { path: '/wp-admin/plugins.php' } );
		setOpenPost( CONTACT_PAGE );

		expect( getCanvasMove() ).toBeNull();
	} );

	it( 'is a no-op without a tool provider', () => {
		expect( withCanvasGuard( undefined ) ).toBeUndefined();
	} );
} );

// The path production actually takes. agenttic-client resolves an ability from
// `getAbilities()` and calls `ability.callback` directly whenever it has one,
// falling back to `executeAbility` only when it does not — and every Big Sky
// ability is registered with a callback. A guard installed on `executeAbility`
// alone never runs against them, which is invisible to any test that calls
// `executeAbility` itself.
describe( 'withCanvasGuard, dispatched through ability callbacks', () => {
	/**
	 * Fetch a guarded ability the way agenttic-client does, then invoke it.
	 * @param provider The guarded provider.
	 * @param name     The registered ability name.
	 * @param input    The arguments, as agenttic-client passes them inline.
	 * @returns Whatever the callback answers.
	 */
	async function callAbility( provider: ToolProvider, name: string, input: unknown ) {
		const abilities = await provider.getAbilities();
		const ability = abilities.find( ( candidate ) => candidate.name === name );

		return ability!.callback!( input as never );
	}

	function createCallbackProvider( callback: jest.Mock ): ToolProvider {
		return {
			getAbilities: jest.fn( () =>
				Promise.resolve( [
					{ name: 'big-sky/editor-navigate', callback },
					{ name: 'big-sky/stream-page-design', callback },
				] )
			),
			executeAbility: jest.fn(),
		} as unknown as ToolProvider;
	}

	beforeEach( () => {
		mockSelect.mockReset();
		startNewUserRequest();
	} );

	it( 'follows the agent to the page it navigates to', async () => {
		// The reported failure. `add-page` creates the page server-side and hands
		// the client an `editor-navigate` call, which arrives as a callback — so
		// this is the dispatch that has to move the binding.
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();

		const callback = jest.fn().mockResolvedValue( { result: { success: true }, ok: true } );
		const guarded = withCanvasGuard( createCallbackProvider( callback ) );

		await callAbility( guarded!, 'big-sky/editor-navigate', { path: '/page/34' } );

		// The navigate result rebinds before the editor has opened the new page.
		bindToOpenCanvas();
		setOpenPost( CONTACT_PAGE );

		expect( callback ).toHaveBeenCalled();
		expect( getCanvasMove() ).toBeNull();
	} );

	it( 'refuses a canvas write whose page has moved', async () => {
		// The other half the callback path was skipping: with the guard only on
		// `executeAbility`, a stale write was never actually refused.
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();
		setOpenPost( CONTACT_PAGE );

		const callback = jest.fn();
		const guarded = withCanvasGuard( createCallbackProvider( callback ) );

		const result = await callAbility( guarded!, 'big-sky/stream-page-design', {} );

		expect( callback ).not.toHaveBeenCalled();
		// The same envelope the guarded abilities return from their own callbacks,
		// so agenttic-client reads `returnToAgent` off it unchanged.
		expect( result ).toMatchObject( {
			returnToAgent: true,
			result: { success: false, error: 'editor_canvas_moved' },
		} );
	} );

	it( 'keeps guarding after a navigation callback reports failure', async () => {
		// The same stuck destination on the dispatch that production uses. Big Sky
		// registers `editor-navigate` with a callback, so this is the path a failed
		// navigation actually takes.
		setOpenPost( ABOUT_PAGE );
		bindToOpenCanvas();

		const failure = {
			result: { success: false, message: 'Could not open that page.' },
			returnToAgent: true,
		};
		const callback = jest.fn().mockResolvedValue( failure );
		const guarded = withCanvasGuard( createCallbackProvider( callback ) );

		const navigation = await callAbility( guarded!, 'big-sky/editor-navigate', {
			path: '/page/34',
		} );

		// The tool result goes out while the editor is still on the page it never
		// left, and the user moves off it.
		bindToOpenCanvas();
		setOpenPost( CONTACT_PAGE );

		const design = await callAbility( guarded!, 'big-sky/stream-page-design', {} );

		// The ability's own answer is handed back untouched.
		expect( navigation ).toBe( failure );
		expect( callback ).toHaveBeenCalledTimes( 1 );
		expect( design ).toMatchObject( { result: { success: false, error: 'editor_canvas_moved' } } );
	} );

	it( 'leaves an ability without a callback untouched', async () => {
		// Nothing to wrap, and wrapping it would invent a callback that makes
		// agenttic-client stop falling back to `executeAbility` for it.
		const provider = {
			getAbilities: jest.fn( () => Promise.resolve( [ { name: 'big-sky/editor-navigate' } ] ) ),
			executeAbility: jest.fn(),
		} as unknown as ToolProvider;

		const abilities = await withCanvasGuard( provider )!.getAbilities();

		expect( abilities[ 0 ].callback ).toBeUndefined();
	} );
} );

describe( 'withCanvasBinding', () => {
	beforeEach( () => {
		mockSelect.mockReset();
		startNewUserRequest();
	} );

	it( 'binds to the open canvas on every outgoing message', () => {
		setOpenPost( ABOUT_PAGE );
		const getClientContext = jest.fn().mockReturnValue( createClientContext() );

		const wrapped = withCanvasBinding( { getClientContext } );
		wrapped!.getClientContext();

		expect( getCanvasMove() ).toBeNull();

		setOpenPost( CONTACT_PAGE );

		expect( getCanvasMove() ).toEqual( { from: 'About', to: 'Contact' } );
	} );

	it( 'passes the context through untouched', () => {
		// Nothing is added to the wire: the binding is read from the editor store
		// here, not carried in the client context.
		setOpenPost( ABOUT_PAGE );
		const context = createClientContext( { currentPageContent: [] } );
		const wrapped = withCanvasBinding( { getClientContext: () => context } );

		expect( wrapped!.getClientContext() ).toBe( context );
	} );

	it( 'rebinds on each call, so a later message follows the user', () => {
		setOpenPost( ABOUT_PAGE );
		const wrapped = withCanvasBinding( { getClientContext: () => createClientContext() } );
		wrapped!.getClientContext();

		setOpenPost( CONTACT_PAGE );
		wrapped!.getClientContext();

		expect( getCanvasMove() ).toBeNull();
		expect( getBlockingMove() ).toBeNull();
	} );

	it( 'is a no-op without a context provider', () => {
		expect( withCanvasBinding( undefined ) ).toBeUndefined();
	} );
} );
