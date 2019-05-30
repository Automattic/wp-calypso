/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { States } from '../constants.js';
import { isExporting, isDateRangeValid } from '../selectors';

describe( 'selectors', () => {
	describe( '#isExporting()', () => {
		test( 'should return false if state is not known', () => {
			const exporting = isExporting(
				{
					exporter: {
						exportingState: {},
					},
				},
				100658273
			);

			expect( exporting ).to.eql( false );
		} );

		test( "should return false if an export hasn't started yet", () => {
			const exporting = isExporting(
				{
					exporter: {
						exportingState: {
							100658273: States.STARTING,
						},
					},
				},
				100658273
			);

			expect( exporting ).to.eql( false );
		} );

		test( 'should return true if an export is in progress', () => {
			const exporting = isExporting(
				{
					exporter: {
						exportingState: {
							100658273: States.EXPORTING,
						},
					},
				},
				100658273
			);

			expect( exporting ).to.eql( true );
		} );

		test( 'should return invalid date if start date is after end date', () => {
			const state = {
				exporter: {
					selectedAdvancedSettings: {
						100658273: {
							post: {
								start_date: '2016-06',
								end_date: '2004-03',
							},
						},
					},
				},
			};
			expect( isDateRangeValid( state, 100658273, 'post' ) ).to.equal( false );
			expect( isDateRangeValid( state, 100658273, 'page' ) ).to.equal( true );
		} );

		test( 'should return valid date if end date is after start date', () => {
			const state = {
				exporter: {
					selectedAdvancedSettings: {
						100658273: {
							post: {
								start_date: '2006-06',
								end_date: '2024-03',
							},
						},
					},
				},
			};
			expect( isDateRangeValid( state, 100658273, 'post' ) ).to.equal( true );
			expect( isDateRangeValid( state, 100658273, 'page' ) ).to.equal( true );
		} );

		test( 'should return valid date if end date is the same as start date', () => {
			const state = {
				exporter: {
					selectedAdvancedSettings: {
						100658273: {
							post: {
								start_date: '2040-06',
								end_date: '2040-06',
							},
						},
					},
				},
			};
			expect( isDateRangeValid( state, 100658273, 'post' ) ).to.equal( true );
			expect( isDateRangeValid( state, 100658273, 'page' ) ).to.equal( true );
		} );
	} );
} );
