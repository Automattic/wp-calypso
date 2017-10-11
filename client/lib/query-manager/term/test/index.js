/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import TermQueryManager from '../';

/**
 * Constants
 */
const DEFAULT_TERM = {
	ID: 586,
	name: 'Food',
	slug: 'my-slug',
	description: '',
	post_count: 5,
};

describe( 'TermQueryManager', () => {
	let manager;
	beforeEach( () => {
		manager = new TermQueryManager();
	} );

	describe( '#matches()', () => {
		describe( 'query.search', () => {
			test( 'should return false for a non-matching search', () => {
				const isMatch = TermQueryManager.matches(
					{
						search: 'Cars',
					},
					DEFAULT_TERM
				);

				expect( isMatch ).to.be.false;
			} );

			test( 'should return true for an empty search', () => {
				const isMatch = TermQueryManager.matches(
					{
						search: '',
					},
					DEFAULT_TERM
				);

				expect( isMatch ).to.be.true;
			} );

			test( 'should return true for a matching name search', () => {
				const isMatch = TermQueryManager.matches(
					{
						search: 'ood',
					},
					DEFAULT_TERM
				);

				expect( isMatch ).to.be.true;
			} );

			test( 'should return true for a matching slug search', () => {
				const isMatch = TermQueryManager.matches(
					{
						search: 'y-sl',
					},
					DEFAULT_TERM
				);

				expect( isMatch ).to.be.true;
			} );

			test( 'should search case-insensitive', () => {
				const isMatch = TermQueryManager.matches(
					{
						search: 'fOoD',
					},
					DEFAULT_TERM
				);

				expect( isMatch ).to.be.true;
			} );
		} );
	} );

	describe( '#compare()', () => {
		describe( 'query.order', () => {
			test( 'should sort ascending by default', () => {
				const sorted = [ { name: 'Food' }, { name: 'Cars' } ].sort(
					manager.compare.bind( manager, {
						order_by: 'name',
					} )
				);

				expect( sorted ).to.eql( [ { name: 'Cars' }, { name: 'Food' } ] );
			} );

			test( 'should reverse order when specified as descending', () => {
				const sorted = [ { name: 'Food' }, { name: 'Cars' } ].sort(
					manager.compare.bind( manager, {
						order_by: 'name',
						order: 'DESC',
					} )
				);

				expect( sorted ).to.eql( [ { name: 'Food' }, { name: 'Cars' } ] );
			} );
		} );

		describe( 'query.order_by', () => {
			describe( 'name', () => {
				test( 'should sort by name', () => {
					const sorted = [ { name: 'Food' }, { name: 'Cars' } ].sort(
						manager.compare.bind( manager, {
							order_by: 'name',
						} )
					);

					expect( sorted ).to.eql( [ { name: 'Cars' }, { name: 'Food' } ] );
				} );
			} );

			describe( 'count', () => {
				const unusedTerm = Object.assign( {}, DEFAULT_TERM, {
					ID: 152,
					post_count: 0,
				} );

				test( 'should sort by post count', () => {
					const sorted = [ DEFAULT_TERM, unusedTerm ].sort(
						manager.compare.bind( manager, {
							order_by: 'count',
						} )
					);

					expect( sorted ).to.eql( [ unusedTerm, DEFAULT_TERM ] );
				} );
			} );
		} );
	} );
} );
