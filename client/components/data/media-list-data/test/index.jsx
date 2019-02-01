/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import MediaListData from 'components/data/media-list-data';

jest.mock( 'lib/media/actions', () => ( { setQuery: () => {}, fetchNextPage: () => {} } ) );
jest.mock( 'lib/media/list-store', () => ( {
	getAll: () => {},
	hasNextPage: () => {},
	isFetchingNextPage: () => {},
	on: () => {},
} ) );

/**
 * Module variables
 */

const DUMMY_SITE_ID = 1;

const EMPTY_COMPONENT = () => {
	return <div />;
};

describe( 'EditorMediaModal', () => {
	test( 'should pass search parameter to query for media data', () => {
		const tree = shallow(
			<MediaListData siteId={ DUMMY_SITE_ID }>
				<EMPTY_COMPONENT />
			</MediaListData>
		).instance();
		const query = { search: true };
		const result = tree.getQuery( query );

		expect( result ).to.eql( query );
	} );

	test( 'should pass and process filter parameter to query for media data', () => {
		const tree = shallow(
			<MediaListData siteId={ DUMMY_SITE_ID }>
				<EMPTY_COMPONENT />
			</MediaListData>
		).instance();
		const query = { filter: 'images' };
		const result = tree.getQuery( query );

		expect( result ).to.eql( { mime_type: 'image/' } );
	} );

	test( 'should pass source parameter and set recent path to query for media data', () => {
		const tree = shallow(
			<MediaListData siteId={ DUMMY_SITE_ID }>
				<EMPTY_COMPONENT />
			</MediaListData>
		).instance();
		const query = { source: 'anything' };
		const result = tree.getQuery( query );

		expect( result ).to.eql( { path: 'recent', source: 'anything' } );
	} );

	test( 'should add valid date range as filter prop on query for media data when both from and to are supplied', () => {
		const queryFilters = {
			dateRange: {
				from: '2019-06-01',
				to: '2019-08-01',
			},
		};

		const tree = shallow(
			<MediaListData siteId={ DUMMY_SITE_ID } queryFilters={ queryFilters }>
				<EMPTY_COMPONENT />
			</MediaListData>
		).instance();

		const actual = tree.getQuery();
		const expected = {
			filter: [ 'dateRange=2019-06-01:2019-08-01' ],
		};

		expect( actual ).to.eql( expected );
	} );

	describe( 'Adding Date Range filters to query for Media data', () => {
		test( 'should add valid date range including wildcard as filter prop on query for media data when only from is supplied', () => {
			const queryFilters = {
				dateRange: {
					from: '2019-06-01',
				},
			};

			const tree = shallow(
				<MediaListData siteId={ DUMMY_SITE_ID } queryFilters={ queryFilters }>
					<EMPTY_COMPONENT />
				</MediaListData>
			).instance();

			const actual = tree.getQuery();

			const expected = {
				filter: [ 'dateRange=2019-06-01:0000-00-00' ],
			};

			expect( actual ).to.eql( expected );
		} );

		test( 'should add valid date range including wildcard as filter prop on query for media data when only to is supplied', () => {
			const queryFilters = {
				dateRange: {
					to: '2019-08-01',
				},
			};

			const tree = shallow(
				<MediaListData siteId={ DUMMY_SITE_ID } queryFilters={ queryFilters }>
					<EMPTY_COMPONENT />
				</MediaListData>
			).instance();

			const actual = tree.getQuery();

			const expected = {
				filter: [ 'dateRange=0000-00-00:2019-08-01' ],
			};

			expect( actual ).to.eql( expected );
		} );

		test( 'should not add date range filter prop on query for media data when neither from or to are supplied', () => {
			const queryFilters = {
				dateRange: {
					// no range supplied
				},
			};

			const tree = shallow(
				<MediaListData siteId={ DUMMY_SITE_ID } queryFilters={ queryFilters }>
					<EMPTY_COMPONENT />
				</MediaListData>
			).instance();

			const actual = tree.getQuery();

			const expected = {
				filter: [],
			};

			expect( actual ).to.eql( expected );
		} );

		test( 'should not add invalid dates to the date range filter prop on query for media data', () => {
			const nonStringDate = new Date();
			const nonISOFormatStringDate = '19th of January 2019';

			const queryFilters = {
				dateRange: {
					from: nonISOFormatStringDate,
					to: nonStringDate,
				},
			};

			const tree = shallow(
				<MediaListData siteId={ DUMMY_SITE_ID } queryFilters={ queryFilters }>
					<EMPTY_COMPONENT />
				</MediaListData>
			).instance();

			const actual = tree.getQuery();

			const expected = {
				filter: [],
			};

			expect( actual ).to.eql( expected );
		} );
	} );
} );
