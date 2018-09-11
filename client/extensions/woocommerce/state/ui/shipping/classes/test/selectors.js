/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getUiShippingClassesState,
	getUiShippingClasses,
	getCurrentlyOpenShippingClass,
	isCurrentlyOpenShippingClassNew,
	getUsedShippingClassProps,
} from '../selectors';
import getState from './data/get-state';

const siteId = 123;

describe( 'Shipping classes UI selectors', () => {
	/**
	 * getUiShippingClassesState
	 */

	test( '#getUiShippingClassesState', () => {
		const state = getState();
		const result = getUiShippingClassesState( state, siteId );
		const expected = state.extensions.woocommerce.ui.shipping[ siteId ].classes;

		expect( result ).to.equal( expected );
	} );

	/**
	 * getUiShippingClasses
	 */

	test( '#getUiShippingClasses', () => {
		const state = getState( {
			created: [ 'temp-1', 'temp-2' ],
			deleted: [ 3 ],
			updates: [
				{
					id: 1,
					name: 'Shipping class A (updated)',
				},
				{
					id: 'temp-1',
					name: 'Shipping class D (a new one)',
				},
				{
					id: 'temp-2',
					name: 'Shipping class E (a new one)',
				},
				{
					id: 'temp-2',
					name: 'Shipping class E (a really new one)',
				},
			],
		} );

		const result = getUiShippingClasses( state, siteId );

		expect( result ).to.have.deep.members( [
			{
				id: 1,
				name: 'Shipping class A (updated)',
			},
			{
				id: 2,
				name: 'Shipping class B',
			},
			{
				id: 'temp-1',
				name: 'Shipping class D (a new one)',
			},
			{
				id: 'temp-2',
				name: 'Shipping class E (a really new one)',
			},
		] );

		expect( result ).not.to.have.deep.members( [
			{
				id: 3,
				name: 'Shipping class C',
			},
		] );
	} );

	/**
	 * getCurrentlyOpenShippingClass
	 */

	test( '#getCurrentlyOpenShippingClass when closed', () => {
		expect( getCurrentlyOpenShippingClass( getState(), siteId ) ).to.equal( null );
	} );

	test( '#getCurrentlyOpenShippingClass when editing a new class', () => {
		const state = getState( {
			editing: true,
		} );

		expect( getCurrentlyOpenShippingClass( state, siteId ) ).to.eql( {
			name: '',
			slug: '',
			description: '',
		} );
	} );

	test( '#getCurrentlyOpenShippingClass when editing an existing and modified class', () => {
		const updatedName = 'Shipping class A (updated)';
		const updatedSlug = 'shipping-class-a';

		const state = getState( {
			editing: true,
			editingClass: 1,
			updates: [
				{
					id: 1,
					name: updatedName,
				},
			],
			changes: {
				slug: updatedSlug,
			},
		} );

		expect( getCurrentlyOpenShippingClass( state, siteId ) ).to.eql( {
			id: 1,
			name: updatedName,
			slug: updatedSlug,
			description: '',
		} );
	} );

	/**
	 * isCurrentlyOpenShippingClassNew
	 */

	test( '#isCurrentlyOpenShippingClassNew when it is', () => {
		const state = getState( {
			editing: true,
		} );

		const result = isCurrentlyOpenShippingClassNew( state, siteId );
		expect( result ).to.equal( true );
	} );

	test( '#isCurrentlyOpenShippingClassNew when it is not', () => {
		const state = getState( {
			editing: true,
			editingClass: 1,
		} );

		const result = isCurrentlyOpenShippingClassNew( state, siteId );
		expect( result ).to.equal( false );
	} );

	/**
	 * getUsedShippingClassProps
	 */

	test( '#getUsedShippingClassProps', () => {
		const shippingClass2 = 'Shipping Class 2';

		const state = getState( {
			deleted: [ 3 ],
			updates: [
				{
					id: 2,
					name: shippingClass2,
				},
			],
		} );

		const result = getUsedShippingClassProps( state, 'name', 1, siteId );

		expect( result ).to.eql( [ shippingClass2 ] );
	} );
} );
