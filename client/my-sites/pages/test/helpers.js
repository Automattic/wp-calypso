/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { sortPagesHierarchically } from '../helpers';

describe( 'helpers', () => {
	describe( 'sortPagesHierarchically()', () => {
		test( 'should place children under parents', () => {
			const testData = [
				{
					ID: 1,
					parent: {
						ID: 2,
					},
				},
				{
					ID: 2,
					parent: false,
				},
				{
					ID: 3,
					parent: {
						ID: 1,
					},
				},
			];

			const sortedPages = sortPagesHierarchically( testData );

			expect( sortedPages ).to.deep.equal( [
				{
					ID: 2,
					parent: false,
				},
				{
					ID: 1,
					indentLevel: 1,
					parent: {
						ID: 2,
					},
				},
				{
					ID: 3,
					indentLevel: 2,
					parent: {
						ID: 1,
					},
				},
			] );
		} );

		test( 'should sort first by hierarchy, then by menu_order', () => {
			const testData = [
				{
					ID: 1,
					menu_order: 0,
					parent: false,
				},
				{
					ID: 2,
					menu_order: 5,
					parent: {
						ID: 1,
					},
				},
				{
					ID: 3,
					menu_order: 2,
					parent: {
						ID: 1,
					},
				},
				{
					ID: 4,
					menu_order: 6,
					parent: false,
				},
			];

			const sortedPages = sortPagesHierarchically( testData );

			expect( sortedPages ).to.deep.equal( [
				{
					ID: 1,
					menu_order: 0,
					parent: false,
				},
				{
					ID: 3,
					indentLevel: 1,
					menu_order: 2,
					parent: {
						ID: 1,
					},
				},
				{
					ID: 2,
					indentLevel: 1,
					menu_order: 5,
					parent: {
						ID: 1,
					},
				},
				{
					ID: 4,
					menu_order: 6,
					parent: false,
				},
			] );
		} );

		test( 'should place orphaned children at top-level, with their children properly beneath them', () => {
			const testData = [
				{
					ID: 1,
					menu_order: 1,
					parent: false,
				},
				{
					ID: 2,
					menu_order: 2,
					parent: {
						ID: 3,
					},
				},
				{
					ID: 3,
					menu_order: 3,
					parent: {
						ID: 5,
					},
				},
				{
					ID: 4,
					menu_order: 4,
					parent: {
						ID: 1,
					},
				},
			];

			const sortedPages = sortPagesHierarchically( testData );

			expect( sortedPages ).to.deep.equal( [
				{
					ID: 1,
					menu_order: 1,
					parent: false,
				},
				{
					ID: 4,
					indentLevel: 1,
					menu_order: 4,
					parent: {
						ID: 1,
					},
				},
				{
					ID: 3,
					menu_order: 3,
					parent: {
						ID: 5,
					},
				},
				{
					ID: 2,
					indentLevel: 1,
					menu_order: 2,
					parent: {
						ID: 3,
					},
				},
			] );
		} );
	} );
} );
