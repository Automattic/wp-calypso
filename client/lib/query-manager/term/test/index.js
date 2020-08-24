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

const makeComparator = ( query ) => ( a, b ) => TermQueryManager.compare( query, a, b );

describe( 'TermQueryManager', () => {
	describe( '#matches()', () => {
		describe( 'query.search', () => {
			test( 'should return false for a non-matching search', () => {
				const isMatch = TermQueryManager.matches(
					{
						search: 'Cars',
					},
					DEFAULT_TERM
				);

				expect( isMatch ).toBe( false );
			} );

			test( 'should return true for an empty search', () => {
				const isMatch = TermQueryManager.matches(
					{
						search: '',
					},
					DEFAULT_TERM
				);

				expect( isMatch ).toBe( true );
			} );

			test( 'should return true for a matching name search', () => {
				const isMatch = TermQueryManager.matches(
					{
						search: 'ood',
					},
					DEFAULT_TERM
				);

				expect( isMatch ).toBe( true );
			} );

			test( 'should return true for a matching slug search', () => {
				const isMatch = TermQueryManager.matches(
					{
						search: 'y-sl',
					},
					DEFAULT_TERM
				);

				expect( isMatch ).toBe( true );
			} );

			test( 'should search case-insensitive', () => {
				const isMatch = TermQueryManager.matches(
					{
						search: 'fOoD',
					},
					DEFAULT_TERM
				);

				expect( isMatch ).toBe( true );
			} );
		} );
	} );

	describe( '#compare()', () => {
		describe( 'query.order', () => {
			test( 'should sort ascending by default', () => {
				const sorted = [ { name: 'Food' }, { name: 'Cars' } ].sort(
					makeComparator( {
						order_by: 'name',
					} )
				);

				expect( sorted ).toEqual( [ { name: 'Cars' }, { name: 'Food' } ] );
			} );

			test( 'should reverse order when specified as descending', () => {
				const sorted = [ { name: 'Food' }, { name: 'Cars' } ].sort(
					makeComparator( {
						order_by: 'name',
						order: 'DESC',
					} )
				);

				expect( sorted ).toEqual( [ { name: 'Food' }, { name: 'Cars' } ] );
			} );
		} );

		describe( 'query.order_by', () => {
			describe( 'name', () => {
				test( 'should sort by name', () => {
					const sorted = [ { name: 'Food' }, { name: 'Cars' } ].sort(
						makeComparator( {
							order_by: 'name',
						} )
					);

					expect( sorted ).toEqual( [ { name: 'Cars' }, { name: 'Food' } ] );
				} );
			} );

			describe( 'count', () => {
				const unusedTerm = Object.assign( {}, DEFAULT_TERM, {
					ID: 152,
					post_count: 0,
				} );

				test( 'should sort by post count', () => {
					const sorted = [ DEFAULT_TERM, unusedTerm ].sort(
						makeComparator( {
							order_by: 'count',
						} )
					);

					expect( sorted ).toEqual( [ unusedTerm, DEFAULT_TERM ] );
				} );
			} );
		} );
	} );
} );
