/**
 * @jest-environment jsdom
 */
import { select } from '@wordpress/data';
import {
	bindToOpenCanvas,
	blockCurrentRequest,
	buildCanvasKey,
	clearCanvasBinding,
	getBlockingMove,
	getCanvasMove,
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

	it( 'reports no move when the live canvas is unreadable', () => {
		// A store that has not settled is not a wrong canvas. Refusing here would
		// block legitimate writes for the width of a mount.
		setOpenPost( { id: 12, type: 'page' } );
		bindToOpenCanvas();

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
