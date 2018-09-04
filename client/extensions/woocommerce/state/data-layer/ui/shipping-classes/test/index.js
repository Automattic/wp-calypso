/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	deleteShippingClass,
	createShippingClass,
	updateShippingClass,
} from 'woocommerce/state/sites/shipping-classes/actions';
import { getSaveShippingClassesSteps, deletingText, creatingText, updatingText } from '../';
import initialClasses from 'woocommerce/state/sites/shipping-classes/test/data/initial-state';
import { initialState } from 'woocommerce/state/ui/shipping/classes/reducer';

const siteId = 123;

const getState = ( uiChanges = {} ) => ( {
	extensions: {
		woocommerce: {
			sites: {
				[ siteId ]: {
					shippingClasses: initialClasses,
				},
			},
			ui: {
				shipping: {
					[ siteId ]: {
						classes: {
							...initialState,
							...uiChanges,
						},
					},
				},
			},
		},
	},
} );

describe( 'getSaveShippingClassesSteps', () => {
	test( 'Generates the proper steps for deletion', () => {
		const state = getState( {
			deleted: [ 1, 2 ],
		} );

		const result = getSaveShippingClassesSteps( state, siteId );
		const expected = [
			{
				description: deletingText,
				action: deleteShippingClass,
				args: [ 1 ],
			},
			{
				description: deletingText,
				action: deleteShippingClass,
				args: [ 2 ],
			},
		];

		expect( result )
			.to.be.an( 'array' )
			.that.eql( expected );
	} );

	test( 'Generates the proper steps for creation', () => {
		const id = 'temp-123';
		const name = 'New Class 123';
		const slug = 'new-class-123';

		const state = getState( {
			created: [ id ],
			updates: [
				{
					id,
					name,
				},
				{
					id,
					slug,
				},
			],
		} );

		const result = getSaveShippingClassesSteps( state, siteId );
		const expected = [
			{
				description: creatingText,
				action: createShippingClass,
				args: [ id, { name, slug } ],
			},
		];

		expect( result )
			.to.be.an( 'array' )
			.that.eql( expected );
	} );

	test( 'Generates the proper steps for an update', () => {
		const id = 1;
		const name = 'Updated Class 1';

		const state = getState( {
			updates: [
				{
					id,
					name,
				},
			],
		} );

		const result = getSaveShippingClassesSteps( state, siteId );
		const expected = [
			{
				description: updatingText,
				action: updateShippingClass,
				args: [ id, { name } ],
			},
		];

		expect( result )
			.to.be.an( 'array' )
			.that.eql( expected );
	} );

	test( 'Can differentiate between updated and created classes', () => {
		const id = 1;
		const temporaryId = 'temp-123';
		const updatedName = 'Updated Class 1';
		const newName = 'Shipping class 123';

		const state = getState( {
			created: [ temporaryId ],
			updates: [
				{
					id: temporaryId,
					name: newName,
				},
				{
					id: id,
					name: updatedName,
				},
			],
		} );

		const result = getSaveShippingClassesSteps( state, siteId );

		expect( result )
			.to.be.an( 'array' )
			.that.eql( [
				{
					description: creatingText,
					action: createShippingClass,
					args: [ temporaryId, { name: newName } ],
				},
				{
					description: updatingText,
					action: updateShippingClass,
					args: [ id, { name: updatedName } ],
				},
			] );
	} );

	test( 'Does not try to save deleted classes', () => {
		const newId = 'temp-123';
		const oldId = 1;
		const updatedTitle = 'Shipping Class A (Updated)';

		const state = getState( {
			deleted: [ 1, newId ],
			created: [ newId ],
			updates: [
				{
					id: newId,
					name: 'New Shipping Class',
				},
				{
					id: oldId,
					name: updatedTitle,
				},
			],
		} );

		const result = getSaveShippingClassesSteps( state, siteId );

		expect( result )
			.to.be.an( 'array' )
			.that.eql( [
				{
					description: deletingText,
					action: deleteShippingClass,
					args: [ oldId ],
				},
			] );
	} );
} );
