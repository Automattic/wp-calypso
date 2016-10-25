/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { SECTION_SET } from 'state/action-types';
import reducer, {
	name,
	paths,
	module as moduleReducer,
	enableLoggedOut,
	secondary,
	group,
	isomorphic,
	title
} from '../reducer';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'name',
			'paths',
			'module',
			'enableLoggedOut',
			'secondary',
			'group',
			'isomorphic',
			'title'
		] );
	} );

	describe( 'name()', () => {
		it( 'should default to null', () => {
			const state = name( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should change its value when specified on action section object', () => {
			const state = name( null, {
				type: SECTION_SET,
				section: {
					name: 'sites'
				}
			} );

			expect( state ).to.equal( 'sites' );
		} );
	} );

	describe( 'paths()', () => {
		it( 'should default to an empty array', () => {
			const state = paths( undefined, {} );

			expect( state ).to.eql( [] );
		} );

		it( 'should change its value when specified on action section object', () => {
			const state = paths( [], {
				type: SECTION_SET,
				section: {
					paths: [ '/sites' ]
				}
			} );

			expect( state ).to.eql( [ '/sites' ] );
		} );
	} );

	describe( 'module()', () => {
		it( 'should default to null', () => {
			const state = moduleReducer( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should change its value when specified on action section object', () => {
			const state = moduleReducer( null, {
				type: SECTION_SET,
				section: {
					module: 'my-sites'
				}
			} );

			expect( state ).to.equal( 'my-sites' );
		} );
	} );

	describe( 'enableLoggedOut()', () => {
		it( 'should default to false', () => {
			const state = enableLoggedOut( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should change its value when specified on action section object', () => {
			const state = enableLoggedOut( false, {
				type: SECTION_SET,
				section: {
					enableLoggedOut: true
				}
			} );

			expect( state ).to.be.true;
		} );
	} );

	describe( 'secondary()', () => {
		it( 'should default to false', () => {
			const state = secondary( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should change its value when specified on action section object', () => {
			const state = secondary( false, {
				type: SECTION_SET,
				section: {
					secondary: true
				}
			} );

			expect( state ).to.be.true;
		} );
	} );

	describe( 'group()', () => {
		it( 'should default to null', () => {
			const state = group( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should change its value when specified on action section object', () => {
			const state = group( null, {
				type: SECTION_SET,
				section: {
					group: 'sites'
				}
			} );

			expect( state ).to.equal( 'sites' );
		} );
	} );

	describe( 'isomorphic()', () => {
		it( 'should default to false', () => {
			const state = isomorphic( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should change its value when specified on action section object', () => {
			const state = isomorphic( false, {
				type: SECTION_SET,
				section: {
					isomorphic: true
				}
			} );

			expect( state ).to.be.true;
		} );
	} );

	describe( 'title()', () => {
		it( 'should default to null', () => {
			const state = title( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should change its value when specified on action section object', () => {
			const state = title( null, {
				type: SECTION_SET,
				section: {
					title: 'Themes'
				}
			} );

			expect( state ).to.equal( 'Themes' );
		} );
	} );
} );
