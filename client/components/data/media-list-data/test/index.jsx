/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { MediaListData } from 'calypso/components/data/media-list-data';

/**
 * Module variables
 */

const DUMMY_SITE_ID = 123456789;

const EMPTY_COMPONENT = () => {
	return <div />;
};

describe( 'EditorMediaModal', () => {
	test( 'should pass search parameter to media query', () => {
		const setQuery = jest.fn();
		const search = 'arbitrary-search-term';

		render(
			<MediaListData siteId={ DUMMY_SITE_ID } setQuery={ setQuery } search={ search }>
				<EMPTY_COMPONENT />
			</MediaListData>
		);

		expect( setQuery ).toHaveBeenCalledWith( DUMMY_SITE_ID, { search } );
	} );

	test( 'should pass and process filter parameter to media query', () => {
		const setQuery = jest.fn();

		render(
			<MediaListData siteId={ DUMMY_SITE_ID } setQuery={ setQuery } filter="images">
				<EMPTY_COMPONENT />
			</MediaListData>
		);

		expect( setQuery ).toHaveBeenCalledWith( DUMMY_SITE_ID, { mime_type: 'image/' } );
	} );

	test( 'should pass and process filter parameter for google photos', () => {
		const setQuery = jest.fn();

		render(
			<MediaListData
				siteId={ DUMMY_SITE_ID }
				setQuery={ setQuery }
				filter="images"
				source="google_photos"
			>
				<EMPTY_COMPONENT />
			</MediaListData>
		);

		expect( setQuery ).toHaveBeenCalledWith( DUMMY_SITE_ID, {
			source: 'google_photos',
			path: 'recent',
			filter: [ 'mediaType=photo' ],
		} );
	} );

	test( 'should not pass and process filter parameter for pexels', () => {
		const setQuery = jest.fn();

		render(
			<MediaListData siteId={ DUMMY_SITE_ID } setQuery={ setQuery } filter="images" source="pexels">
				<EMPTY_COMPONENT />
			</MediaListData>
		);

		expect( setQuery ).toHaveBeenCalledWith( DUMMY_SITE_ID, { source: 'pexels', path: 'recent' } );
	} );

	test( 'should pass source parameter and set recent path to media query', () => {
		const setQuery = jest.fn();

		render(
			<MediaListData siteId={ DUMMY_SITE_ID } setQuery={ setQuery } source="anything">
				<EMPTY_COMPONENT />
			</MediaListData>
		);

		expect( setQuery ).toHaveBeenCalledWith( DUMMY_SITE_ID, {
			path: 'recent',
			source: 'anything',
		} );
	} );

	test( 'should pass categoryFilter parameter to media query for Google Photos', () => {
		const setQuery = jest.fn();
		render(
			<MediaListData
				siteId={ DUMMY_SITE_ID }
				setQuery={ setQuery }
				categoryFilter="cats"
				source="google_photos"
			>
				<EMPTY_COMPONENT />
			</MediaListData>
		);

		expect( setQuery ).toHaveBeenCalledWith( DUMMY_SITE_ID, {
			filter: [ 'categoryInclude=cats' ],
			path: 'recent',
			source: 'google_photos',
		} );
	} );

	test( 'should not pass categoryFilter parameter to media query for other sources', () => {
		const setQuery = jest.fn();

		render(
			<MediaListData siteId={ DUMMY_SITE_ID } setQuery={ setQuery } categoryFilter="cats">
				<EMPTY_COMPONENT />
			</MediaListData>
		);

		expect( setQuery ).toHaveBeenCalledWith( DUMMY_SITE_ID, {} );
	} );
} );
