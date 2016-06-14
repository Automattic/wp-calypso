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
	post_count: 5
};

describe( 'TermQueryManager', () => {
	let manager;
	beforeEach( () => {
		manager = new TermQueryManager();
	} );

	describe( '#matches()', () => {
		context( 'query.search', () => {
			it( 'should return false for a non-matching search', () => {
				const isMatch = manager.matches( {
					search: 'Cars'
				}, DEFAULT_TERM );

				expect( isMatch ).to.be.false;
			} );

			it( 'should return true for an empty search', () => {
				const isMatch = manager.matches( {
					search: ''
				}, DEFAULT_TERM );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true for a matching name search', () => {
				const isMatch = manager.matches( {
					search: 'ood'
				}, DEFAULT_TERM );

				expect( isMatch ).to.be.true;
			} );

			it( 'should return true for a matching slug search', () => {
				const isMatch = manager.matches( {
					search: 'y-sl'
				}, DEFAULT_TERM );

				expect( isMatch ).to.be.true;
			} );

			it( 'should search case-insensitive', () => {
				const isMatch = manager.matches( {
					search: 'fOoD'
				}, DEFAULT_TERM );

				expect( isMatch ).to.be.true;
			} );
		} );
	} );

	describe( '#sort()', () => {
		context( 'query.order', () => {
			it( 'should sort ascending by default', () => {
				const sorted = [
					{ name: 'Food' },
					{ name: 'Cars' }
				].sort( manager.sort.bind( manager, {
					order_by: 'name'
				} ) );

				expect( sorted ).to.eql( [
					{ name: 'Cars' },
					{ name: 'Food' }
				] );
			} );

			it( 'should reverse order when specified as descending', () => {
				const sorted = [
					{ name: 'Food' },
					{ name: 'Cars' }
				].sort( manager.sort.bind( manager, {
					order_by: 'name',
					order: 'DESC'
				} ) );

				expect( sorted ).to.eql( [
					{ name: 'Food' },
					{ name: 'Cars' }
				] );
			} );
		} );

		context( 'query.order_by', () => {
			context( 'name', () => {
				it( 'should sort by name', () => {
					const sorted = [
						{ name: 'Food' },
						{ name: 'Cars' }
					].sort( manager.sort.bind( manager, {
						order_by: 'name'
					} ) );

					expect( sorted ).to.eql( [
						{ name: 'Cars' },
						{ name: 'Food' }
					] );
				} );
			} );

			context( 'count', () => {
				const unusedTerm = Object.assign( {}, DEFAULT_TERM, {
					ID: 152,
					post_count: 0
				} );

				it( 'should sort by post count', () => {
					const sorted = [
						DEFAULT_TERM,
						unusedTerm
					].sort( manager.sort.bind( manager, {
						order_by: 'count'
					} ) );

					expect( sorted ).to.eql( [
						unusedTerm,
						DEFAULT_TERM
					] );
				} );
			} );
		} );
	} );
} );
