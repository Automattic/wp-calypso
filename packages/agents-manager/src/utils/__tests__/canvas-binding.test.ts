/**
 * @jest-environment jsdom
 */
import { select } from '@wordpress/data';
import {
	bindToNavigationTarget,
	bindToOpenCanvas,
	blockCurrentRequest,
	buildCanvasKey,
	clearCanvasBinding,
	getBlockingMove,
	getCanvasMove,
	isCanvasWritingAgent,
	resolveCanvasKey,
	startNewUserRequest,
} from '../canvas-binding';

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

describe( 'canvas binding', () => {
	beforeEach( () => {
		mockSelect.mockReset();
		startNewUserRequest();
	} );

	it.each( [ 'wp-orchestrator', 'wpcom-workflow-unified_chat' ] )(
		'treats %s as an agent that can write to the canvas',
		( agentId ) => {
			expect( isCanvasWritingAgent( agentId ) ).toBe( true );
		}
	);

	it.each( [ 'reader-chat', 'wpcom-workflow-support_chat', 'dolly', undefined, '' ] )(
		'treats %s as an agent that cannot',
		( agentId ) => {
			expect( isCanvasWritingAgent( agentId ) ).toBe( false );
		}
	);

	it( 'builds a key from post type and id', () => {
		expect( buildCanvasKey( 'page', 12 ) ).toBe( 'page:12' );
	} );

	it( 'has no key when the post type or id is missing', () => {
		expect( buildCanvasKey( 'page', undefined ) ).toBeNull();
		expect( buildCanvasKey( undefined, 12 ) ).toBeNull();
	} );

	it( 'resolves the key from the editor store', () => {
		setOpenPost( { id: 12, type: 'page' } );

		expect( resolveCanvasKey() ).toBe( 'page:12' );
	} );

	it( 'resolves no key when the editor store is absent', () => {
		setOpenPost( null );

		expect( resolveCanvasKey() ).toBeNull();
	} );

	it( 'resolves no key when the editor store throws', () => {
		mockSelect.mockImplementation( () => {
			throw new Error( 'Editor store unavailable' );
		} );

		expect( resolveCanvasKey() ).toBeNull();
	} );

	it( 'reports no move while the canvas has not changed', () => {
		setOpenPost( { id: 12, type: 'page', title: 'About' } );
		bindToOpenCanvas();

		expect( getCanvasMove() ).toBeNull();
	} );

	it( 'reports a move once the canvas changes, naming both pages', () => {
		setOpenPost( { id: 12, type: 'page', title: 'About' } );
		bindToOpenCanvas();

		setOpenPost( { id: 34, type: 'page', title: 'Contact' } );

		expect( getCanvasMove() ).toEqual( { from: 'About', to: 'Contact' } );
	} );

	it( 'falls back to the key when a page has no title', () => {
		setOpenPost( { id: 12, type: 'page' } );
		bindToOpenCanvas();

		setOpenPost( { id: 34, type: 'page' } );

		expect( getCanvasMove() ).toEqual( { from: 'page:12', to: 'page:34' } );
	} );

	it( 'treats a post and a template sharing an id as different canvases', () => {
		// The reason the key carries the post type: ids are only unique within one.
		setOpenPost( { id: 12, type: 'page' } );
		bindToOpenCanvas();

		setOpenPost( { id: 12, type: 'wp_template' } );

		expect( getCanvasMove() ).toEqual( { from: 'page:12', to: 'wp_template:12' } );
	} );

	it( 'reports no move when nothing was bound', () => {
		setOpenPost( { id: 34, type: 'page' } );

		expect( getCanvasMove() ).toBeNull();
	} );

	it( 'reports a move to nowhere when the canvas goes away', () => {
		// Losing the canvas is a move, not a wait. A bound request was made while the
		// editor was mounted, so an absent canvas means the user left — and the write
		// abilities poll for a canvas, so letting this through loops forever.
		setOpenPost( { id: 12, type: 'page', title: 'About' } );
		bindToOpenCanvas();

		setOpenPost( null );

		expect( getCanvasMove() ).toEqual( { from: 'About', to: null } );
	} );

	it( 'reports no move for a mounting canvas when nothing is bound', () => {
		// The agent navigating itself clears the binding first, so the mount that
		// follows is unguarded and the write abilities do their own readiness retry.
		setOpenPost( { id: 12, type: 'page' } );
		bindToOpenCanvas();
		clearCanvasBinding();

		setOpenPost( null );

		expect( getCanvasMove() ).toBeNull();
	} );

	it( 'drops the binding when the agent moves the canvas itself', () => {
		setOpenPost( { id: 12, type: 'page' } );
		bindToOpenCanvas();
		clearCanvasBinding();

		setOpenPost( { id: 34, type: 'page' } );

		expect( getCanvasMove() ).toBeNull();
	} );

	it( 'puts the previous binding back when a navigation never happens', () => {
		// A destination is an assertion about a move that has not run yet. If it
		// never runs, rolling back to the page that was bound — not to whatever is
		// live — is what keeps a user navigation during the failed attempt visible.
		setOpenPost( { id: 12, type: 'page', title: 'About' } );
		bindToOpenCanvas();

		const rollback = bindToNavigationTarget( 'page:34' );
		rollback();

		setOpenPost( { id: 56, type: 'page', title: 'Pricing' } );

		expect( getCanvasMove() ).toEqual( { from: 'About', to: 'Pricing' } );
	} );

	it( 'keeps the destination when the editor arrived before the rollback', () => {
		// An ability can report failure after it has already moved the editor. The
		// page on screen is then the one the request belongs to, not the one it left.
		setOpenPost( { id: 12, type: 'page', title: 'About' } );
		bindToOpenCanvas();

		const rollback = bindToNavigationTarget( 'page:34' );
		setOpenPost( { id: 34, type: 'page', title: 'Contact' } );
		rollback();

		expect( getCanvasMove() ).toBeNull();
	} );

	it( 'leaves a binding taken since the navigation alone', () => {
		// The rollback must not undo whatever replaced the binding after it. Object
		// identity cannot tell that on its own: the unbound state reads as null
		// however it was reached.
		setOpenPost( { id: 12, type: 'page', title: 'About' } );
		bindToOpenCanvas();

		const rollback = clearCanvasBinding();
		setOpenPost( { id: 34, type: 'page', title: 'Contact' } );
		bindToOpenCanvas();
		rollback();

		setOpenPost( { id: 56, type: 'page', title: 'Pricing' } );

		expect( getCanvasMove() ).toEqual( { from: 'Contact', to: 'Pricing' } );
	} );

	it( 'latches the move that blocked the request', () => {
		setOpenPost( { id: 12, type: 'page', title: 'About' } );
		bindToOpenCanvas();
		setOpenPost( { id: 34, type: 'page', title: 'Contact' } );

		expect( blockCurrentRequest() ).toBe( true );

		// Rebinding to the page the user moved to must not clear the block, or the
		// model could retry the refused write onto the new page.
		bindToOpenCanvas();

		expect( getCanvasMove() ).toBeNull();
		expect( getBlockingMove() ).toEqual( { from: 'About', to: 'Contact' } );
	} );

	it( 'keeps the first move when blocked again', () => {
		setOpenPost( { id: 12, type: 'page', title: 'About' } );
		bindToOpenCanvas();
		setOpenPost( { id: 34, type: 'page', title: 'Contact' } );
		blockCurrentRequest();

		bindToOpenCanvas();
		setOpenPost( { id: 56, type: 'page', title: 'Pricing' } );

		expect( blockCurrentRequest() ).toBe( true );
		expect( getBlockingMove() ).toEqual( { from: 'About', to: 'Contact' } );
	} );

	it( 'cannot block without a real move', () => {
		setOpenPost( { id: 12, type: 'page' } );
		bindToOpenCanvas();

		expect( blockCurrentRequest() ).toBe( false );
		expect( getBlockingMove() ).toBeNull();
	} );

	it( 'lifts the block for a new user message', () => {
		setOpenPost( { id: 12, type: 'page', title: 'About' } );
		bindToOpenCanvas();
		setOpenPost( { id: 34, type: 'page', title: 'Contact' } );
		blockCurrentRequest();

		startNewUserRequest();

		expect( getBlockingMove() ).toBeNull();
	} );
} );
