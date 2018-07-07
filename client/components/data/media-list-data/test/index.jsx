/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { shallow } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import MediaListData from 'components/data/media-list-data';

jest.mock( 'lib/media/actions', () => ( { setQuery: () => {}, fetchNextPage: () => {} } ) );
jest.mock( 'lib/media/list-store', () => ( {
	getAll: () => {
		return [];
	},
	hasNextPage: () => {
		return true;
	},
	isFetchingNextPage: () => {
		return false;
	},
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

		expect( result ).toEqual( query );
	} );

	test( 'should pass and process filter parameter to media query', () => {
		const tree = shallow(
			<MediaListData siteId={ DUMMY_SITE_ID }>
				<EMPTY_COMPONENT />
			</MediaListData>
		).instance();
		const query = { filter: 'images' };
		const result = tree.getQuery( query );

		expect( result ).toEqual( { mime_type: 'image/' } );
	} );

	test( 'should pass source parameter and set recent path to media query', () => {
		const tree = shallow(
			<MediaListData siteId={ DUMMY_SITE_ID }>
				<EMPTY_COMPONENT />
			</MediaListData>
		).instance();
		const query = { source: 'anything' };
		const result = tree.getQuery( query );

		expect( result ).toEqual( { path: 'recent', source: 'anything' } );
	} );

	test( 'should pass folder parameter to media query', () => {
		const expected = '/';
		const tree = shallow(
			<MediaListData siteId={ DUMMY_SITE_ID } folder={ expected }>
				<EMPTY_COMPONENT />
			</MediaListData>
		).instance();

		const result = tree.getQuery();
		expect( result ).toEqual( { folder: expected } );
	} );

	test( 'should call onGetData callback prop with Media data', () => {
		const mock = jest.fn();

		shallow(
			<MediaListData siteId={ DUMMY_SITE_ID } onGetData={ mock }>
				<EMPTY_COMPONENT />
			</MediaListData>
		);

		expect( mock ).toHaveBeenCalledTimes( 2 );
		expect( mock ).toHaveBeenCalledWith(
			expect.objectContaining( {
				media: expect.any( Array ),
				mediaHasNextPage: expect.any( Boolean ),
				mediaFetchingNextPage: expect.any( Boolean ),
			} )
		);
	} );
} );
