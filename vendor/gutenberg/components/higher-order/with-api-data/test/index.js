/**
 * External dependencies
 */
import renderer from 'react-test-renderer';
import { identity, fromPairs } from 'lodash';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import withAPIData from '../';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';

class PassContext extends Component {
	getChildContext() {
		return this.props.value;
	}

	render() {
		return this.props.children;
	}
}

PassContext.childContextTypes = {
	getAPISchema: PropTypes.any,
	getAPIPostTypeRestBaseMapping: PropTypes.any,
	getAPITaxonomyRestBaseMapping: PropTypes.any,
};

jest.mock( '../request', () => {
	const request = jest.fn( ( { path } ) => {
		if ( /\/users$/.test( path ) ) {
			return Promise.reject( {
				code: 'rest_forbidden_context',
				message: 'Sorry, you are not allowed to list users.',
				data: { status: 403 },
			} );
		}

		return Promise.resolve( { body: {} } );
	} );

	request.getCachedResponse = ( { method, path } ) => {
		return method === 'GET' && '/wp/v2/pages/10' === path ?
			{ body: { title: 'OK!' }, headers: [] } :
			undefined;
	};

	return request;
} );

describe( 'withAPIData()', () => {
	const schema = {
		routes: {
			'/wp/v2/pages/(?P<parent>[\\d]+)/revisions': {
				methods: [ 'GET' ],
			},
			'/wp/v2/users': {
				methods: [ 'GET' ],
			},
			'/wp/v2/pages/(?P<id>[\\d]+)': {
				methods: [
					'GET',
					'POST',
					'PUT',
					'PATCH',
					'DELETE',
				],
			},
		},
	};

	let TestComponent, context;

	function getWrapper( mapPropsToData, props ) {
		if ( ! mapPropsToData ) {
			mapPropsToData = () => ( {
				revisions: '/wp/v2/pages/5/revisions',
			} );
		}

		TestComponent = withAPIData( mapPropsToData )( () => '' );
		context = {
			getAPISchema: () => schema,
			getAPIPostTypeRestBaseMapping: identity,
			getAPITaxonomyRestBaseMapping: identity,
		};
		return renderer.create( getTestComponent( context, props ) );
	}

	function getTestComponent( contextValues, props ) {
		return (
			<PassContext value={ contextValues }>
				<TestComponent { ...props } />
			</PassContext>
		);
	}

	const getDataProps = ( wrapper ) => {
		return wrapper.toTree().rendered.instance.state.dataProps;
	};

	it( 'should initialize fetchables on mount', ( done ) => {
		const wrapper = getWrapper();

		expect( Object.keys( getDataProps( wrapper ) ) ).toEqual( [ 'revisions' ] );
		expect( Object.keys( getDataProps( wrapper ).revisions ) ).toEqual( [
			'get',
			'isLoading',
			'path',
		] );
		expect( getDataProps( wrapper ).revisions.isLoading ).toBe( true );

		process.nextTick( () => {
			expect( getDataProps( wrapper ).revisions.isLoading ).toBe( false );
			expect( getDataProps( wrapper ).revisions.data ).toEqual( {} );
			done();
		} );
	} );

	it( 'should handle error response', ( done ) => {
		const wrapper = getWrapper( () => ( {
			users: '/wp/v2/users',
		} ) );

		process.nextTick( () => {
			expect( getDataProps( wrapper ).users.isLoading ).toBe( false );
			expect( getDataProps( wrapper ).users ).not.toHaveProperty( 'data' );
			expect( getDataProps( wrapper ).users.error.code ).toBe( 'rest_forbidden_context' );

			done();
		} );
	} );

	it( 'should preassign cached data', ( done ) => {
		const wrapper = getWrapper( () => ( {
			page: '/wp/v2/pages/10',
		} ) );

		expect( Object.keys( getDataProps( wrapper ) ) ).toEqual( [ 'page' ] );
		expect( Object.keys( getDataProps( wrapper ).page ) ).toEqual( expect.arrayContaining( [
			'get',
			'isLoading',
			'path',
			'data',
		] ) );
		expect( getDataProps( wrapper ).page.isLoading ).toBe( false );
		expect( getDataProps( wrapper ).page.data ).toEqual( { title: 'OK!' } );

		process.nextTick( () => {
			expect( getDataProps( wrapper ).page.isLoading ).toBe( false );

			done();
		} );
	} );

	it( 'should assign an empty prop object for unmatched resources', () => {
		const wrapper = getWrapper( () => ( {
			unknown: '/wp/v2/unknown/route',
		} ) );

		expect( Object.keys( getDataProps( wrapper ) ) ).toEqual( [ 'unknown' ] );
		expect( Object.keys( getDataProps( wrapper ).unknown ) ).toEqual( [] );
		expect( wrapper.toTree().rendered.rendered.props.unknown ).toEqual( {} );
	} );

	it( 'should include full gamut of method available properties', () => {
		const wrapper = getWrapper( () => ( {
			page: '/wp/v2/pages/5',
		} ) );

		expect( Object.keys( getDataProps( wrapper ) ) ).toEqual( [ 'page' ] );
		expect( Object.keys( getDataProps( wrapper ).page ) ).toEqual( [
			'get',
			'isLoading',
			'path',
			'create',
			'isCreating',
			'save',
			'isSaving',
			'patch',
			'isPatching',
			'delete',
			'isDeleting',
		] );
		expect( getDataProps( wrapper ).page.isLoading ).toBe( true );
		expect( getDataProps( wrapper ).page.isCreating ).toBe( false );
		expect( getDataProps( wrapper ).page.isSaving ).toBe( false );
		expect( getDataProps( wrapper ).page.isPatching ).toBe( false );
		expect( getDataProps( wrapper ).page.isDeleting ).toBe( false );
	} );

	it( 'should not clobber existing data when receiving new props', ( done ) => {
		const wrapper = getWrapper(
			( { pages } ) => fromPairs( pages.map( ( page ) => [
				'page' + page,
				'/wp/v2/pages/' + page,
			] ) ),
			{ pages: [ 1 ] }
		);

		process.nextTick( () => {
			wrapper.update( getTestComponent( context, { pages: [ 1, 2 ] } ) );

			expect( getDataProps( wrapper ).page1.isLoading ).toBe( false );
			expect( getDataProps( wrapper ).page1.data ).toEqual( {} );
			expect( getDataProps( wrapper ).page2.isLoading ).toBe( true );

			done();
		} );
	} );

	it( 'should remove dropped mappings', ( done ) => {
		const wrapper = getWrapper(
			( { pages } ) => fromPairs( pages.map( ( page ) => [
				'page' + page,
				'/wp/v2/pages/' + page,
			] ) ),
			{ pages: [ 1 ] }
		);

		process.nextTick( () => {
			wrapper.update( getTestComponent( context, { pages: [ 2 ] } ) );

			expect( getDataProps( wrapper ) ).not.toHaveProperty( 'page1' );
			expect( getDataProps( wrapper ) ).toHaveProperty( 'page2' );

			done();
		} );
	} );

	it( 'should refetch on changed path', ( done ) => {
		const wrapper = getWrapper(
			( { pageId } ) => ( {
				page: `/wp/v2/pages/${ pageId }`,
			} ),
			{ pageId: 5 }
		);

		process.nextTick( () => {
			expect( getDataProps( wrapper ).page.isLoading ).toBe( false );
			wrapper.update( getTestComponent( context, { pageId: 7 } ) );
			expect( getDataProps( wrapper ).page.isLoading ).toBe( true );

			done();
		} );
	} );
} );
