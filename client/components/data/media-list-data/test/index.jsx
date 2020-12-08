/**
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
import { MediaListData } from 'calypso/components/data/media-list-data';

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

	test( 'should pass and process filter parameter for google photos', () => {
		const tree = shallow(
			<MediaListData siteId={ DUMMY_SITE_ID }>
				<EMPTY_COMPONENT />
			</MediaListData>
		).instance();
		const query = { filter: 'images', source: 'google_photos' };
		const result = tree.getQuery( query );

		expect( result ).to.eql( {
			source: 'google_photos',
			path: 'recent',
			filter: [ 'mediaType=photo' ],
		} );
	} );

	test( 'should not pass and process filter parameter for pexels', () => {
		const tree = shallow(
			<MediaListData siteId={ DUMMY_SITE_ID }>
				<EMPTY_COMPONENT />
			</MediaListData>
		).instance();
		const query = { filter: 'images', source: 'pexels' };
		const result = tree.getQuery( query );

		expect( result ).to.eql( { source: 'pexels', path: 'recent' } );
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

	test( 'should pass categoryFilter parameter to media query for Google Photos', () => {
		const tree = shallow(
			<MediaListData siteId={ DUMMY_SITE_ID }>
				<EMPTY_COMPONENT />
			</MediaListData>
		).instance();
		const query = { categoryFilter: 'cats', source: 'google_photos' };
		const result = tree.getQuery( query );

		expect( result ).to.eql( {
			filter: [ 'categoryInclude=cats' ],
			path: 'recent',
			source: 'google_photos',
		} );
	} );

	test( 'should not pass categoryFilter parameter to media query for other sources', () => {
		const tree = shallow(
			<MediaListData siteId={ DUMMY_SITE_ID }>
				<EMPTY_COMPONENT />
			</MediaListData>
		).instance();
		const query = { categoryFilter: 'cats', source: '' };
		const result = tree.getQuery( query );

		expect( result ).to.eql( {} );
	} );
} );
