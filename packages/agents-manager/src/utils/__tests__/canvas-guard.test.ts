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
 *
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

	it( 'is a no-op without a tool provider', () => {
		expect( withCanvasGuard( undefined ) ).toBeUndefined();
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
