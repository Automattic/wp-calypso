/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { getPostEditURL, getPostTrashedURL, BrowserURL } from '../';

describe( 'getPostEditURL', () => {
	it( 'should generate relative path with post and action arguments', () => {
		const url = getPostEditURL( 1 );

		expect( url ).toBe( 'post.php?post=1&action=edit' );
	} );
} );

describe( 'getPostTrashedURL', () => {
	it( 'should generate relative path with post and action arguments', () => {
		const url = getPostTrashedURL( 1, 'page' );

		expect( url ).toBe( 'edit.php?trashed=1&post_type=page&ids=1' );
	} );
} );

describe( 'BrowserURL', () => {
	let replaceStateSpy;

	beforeAll( () => {
		replaceStateSpy = jest.spyOn( window.history, 'replaceState' );
	} );

	beforeEach( () => {
		replaceStateSpy.mockReset();
	} );

	afterAll( () => {
		replaceStateSpy.mockRestore();
	} );

	it( 'not update URL if post is auto-draft', () => {
		const wrapper = shallow( <BrowserURL /> );
		wrapper.setProps( {
			postId: 1,
			postStatus: 'auto-draft',
		} );

		expect( replaceStateSpy ).not.toHaveBeenCalled();
	} );

	it( 'update URL if post is no longer auto-draft', () => {
		const wrapper = shallow( <BrowserURL /> );
		wrapper.setProps( {
			postId: 1,
			postStatus: 'auto-draft',
		} );
		wrapper.setProps( {
			postStatus: 'draft',
		} );

		expect( replaceStateSpy ).toHaveBeenCalledWith(
			{ id: 1 },
			'Post 1',
			'post.php?post=1&action=edit'
		);
	} );

	it( 'not update URL if history is already set', () => {
		const wrapper = shallow( <BrowserURL /> );
		wrapper.setProps( {
			postId: 1,
			postStatus: 'draft',
		} );
		replaceStateSpy.mockReset();
		wrapper.setProps( {
			postId: 1,
		} );

		expect( replaceStateSpy ).not.toHaveBeenCalled();
	} );

	it( 'update URL if post ID changes', () => {
		const wrapper = shallow( <BrowserURL /> );
		wrapper.setProps( {
			postId: 1,
			postStatus: 'draft',
		} );
		replaceStateSpy.mockReset();
		wrapper.setProps( {
			postId: 2,
		} );

		expect( replaceStateSpy ).toHaveBeenCalledWith(
			{ id: 2 },
			'Post 2',
			'post.php?post=2&action=edit'
		);
	} );

	it( 'renders nothing', () => {
		const wrapper = shallow( <BrowserURL /> );

		expect( wrapper.type() ).toBeNull();
	} );
} );
