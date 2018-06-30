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
import moment from 'moment';

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
	test( 'should pass search parameter to media query', () => {
		const tree = shallow(
			<MediaListData siteId={ DUMMY_SITE_ID }>
				<EMPTY_COMPONENT />
			</MediaListData>
		).instance();
		const query = { search: true };
		const result = tree.getQuery( query );

		expect( result ).to.eql( query );
	} );

	test( 'should pass and process filter parameter to media query', () => {
		const tree = shallow(
			<MediaListData siteId={ DUMMY_SITE_ID }>
				<EMPTY_COMPONENT />
			</MediaListData>
		).instance();
		const query = { filter: 'images' };
		const result = tree.getQuery( query );

		expect( result ).to.eql( { mime_type: 'image/' } );
	} );

	test( 'should pass source parameter and set recent path to media query', () => {
		const tree = shallow(
			<MediaListData siteId={ DUMMY_SITE_ID }>
				<EMPTY_COMPONENT />
			</MediaListData>
		).instance();
		const query = { source: 'anything' };
		const result = tree.getQuery( query );

		expect( result ).to.eql( { path: 'recent', source: 'anything' } );
	} );

	test( 'should pass dateRange prop to media query as dateFrom and dateTo unix timestamps', () => {
		const dateRange = {
			from: moment().subtract( '1 month' ),
			to: moment(),
		};

		const tree = shallow(
			<MediaListData siteId={ DUMMY_SITE_ID } dateRange={ dateRange }>
				<EMPTY_COMPONENT />
			</MediaListData>
		).instance();

		const result = tree.getQuery();

		expect( result ).to.eql( {
			dateFrom: dateRange.from.unix(),
			dateTo: dateRange.to.unix(),
		} );
	} );
} );
