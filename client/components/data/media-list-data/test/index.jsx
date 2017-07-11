/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import mockery from 'mockery';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import useMockery from 'test/helpers/use-mockery';

/**
 * Module variables
 */

const DUMMY_SITE_ID = 1;

const EMPTY_COMPONENT = () => {
	return <div />;
};

describe( 'EditorMediaModal', function() {
	let MediaListData;

	useMockery();

	before( () => {
		mockery.registerMock( 'lib/media/actions', { setQuery: noop, fetchNextPage: noop } );
		mockery.registerMock( 'lib/media/list-store', { getAll: noop, hasNextPage: noop, isFetchingNextPage: noop, on: noop } );

		MediaListData = require( 'components/data/media-list-data' );
	} );

	it( 'should pass search parameter to media query', () => {
		const tree = shallow( <MediaListData siteId={ DUMMY_SITE_ID }><EMPTY_COMPONENT /></MediaListData> ).instance();
		const query = { search: true };
		const result = tree.getQuery( query );

		expect( result ).to.eql( query );
	} );

	it( 'should pass and process filter parameter to media query', () => {
		const tree = shallow( <MediaListData siteId={ DUMMY_SITE_ID }><EMPTY_COMPONENT /></MediaListData> ).instance();
		const query = { filter: 'images' };
		const result = tree.getQuery( query );

		expect( result ).to.eql( { mime_type: 'image/' } );
	} );

	it( 'should pass source parameter and set recent path to media query', () => {
		const tree = shallow( <MediaListData siteId={ DUMMY_SITE_ID }><EMPTY_COMPONENT /></MediaListData> ).instance();
		const query = { source: 'anything' };
		const result = tree.getQuery( query );

		expect( result ).to.eql( { path: 'recent', source: 'anything' } );
	} );
} );
