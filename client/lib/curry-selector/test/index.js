/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { get, filter, first, find } from 'lodash';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import currySelector from '../';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'index', () => {
	let arity1Selector;
	let arity2Selector;
	let arity3Selector;
	let arity1SelectorCurried;
	let arity2SelectorCurried;
	let arity3SelectorCurried;

	useSandbox( sandbox => {
		sandbox.stub( console, 'warn' );
		arity1Selector = sandbox.spy( state => first( state.posts ) );
		arity2Selector = sandbox.spy( ( state, id ) => find( state.posts, { id } ) );
		arity3Selector = sandbox.spy( ( state, id, nothing ) => find( state.posts, { id } ) );
	} );

	beforeAll( () => {
		arity1SelectorCurried = currySelector( arity1Selector );
		arity2SelectorCurried = currySelector( arity2Selector );
		arity3SelectorCurried = currySelector( arity3Selector );
	} );

	test( 'allows the given selector to function as usual when arity is filled', () => {} );

	test( 'treats the state arguement as the last arguement when arity -1 is given', () => {
		const matchingPost = {
			id: '11111',
			title: 'Howdy World!',
			title: 'Howdy World!',
		};
		const nonMatchingPost = {
			id: '22222',
			title: 'Hello World',
		};
		const state = {
			posts: [ matchingPost, nonMatchingPost ],
		};
		const actual = arity3SelectorCurried( '11111', 'nothing' )( state );
		const expected = matchingPost;

		expect( actual ).to.equal( expected );
	} );

	test( 'should create a function which returns the expected value when called', () => {
		const matchingPost = {
			id: '11111',
			title: 'Howdy World!',
			title: 'Howdy World!',
		};
		const nonMatchingPost = {
			id: '22222',
			title: 'Hello World',
		};
		const state = {
			posts: [ matchingPost, nonMatchingPost ],
		};
		const actual = arity2SelectorCurried( state, '11111' );
		const expected = matchingPost;

		expect( actual ).to.equal( expected );
	} );
} );
