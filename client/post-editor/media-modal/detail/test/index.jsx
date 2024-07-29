/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import siteSettingsReducer from 'calypso/state/site-settings/reducer';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { EditorMediaModalDetailItem as DetailItem } from '../detail-item';

jest.mock( 'calypso/components/file-picker', () =>
	require( 'calypso/components/empty-component' )
);

function renderWithRedux( ui ) {
	return renderWithProvider( ui, {
		reducers: {
			ui: uiReducer,
			siteSettings: siteSettingsReducer,
		},
	} );
}

/**
 * Module variables
 */
const DUMMY_SITE = { ID: 1 };

const DUMMY_IMAGE_MEDIA = {
	ID: 100,
	date: '2015-06-19T11:36:09-04:00',
	mime_type: 'image/jpeg',
	guid: 'http://wordpress.com/test.jpg',
	URL: 'http://wordpress.com/test.jpg',
};

const DUMMY_VIDEO_MEDIA = {
	ID: 200,
	date: '2015-06-19T11:36:09-04:00',
	mime_type: 'video/mp4',
	videopress_guid: 'testvideopressguid123',
	guid: 'http://wordpress.com/test.mp4',
	URL: 'http://wordpress.com/test.mp4',
};

const SHARED_PROPS = {
	site: DUMMY_SITE,
	canUserUploadFiles: true,
	translate: ( str ) => str,
};

describe( 'EditorMediaModalDetailItem', () => {
	const isVideoPressEnabled = jest.fn( () => true );

	test( 'should display at least one edit button for a VideoPress video on a public site', () => {
		renderWithRedux(
			<DetailItem
				item={ DUMMY_VIDEO_MEDIA }
				isVideoPressEnabled={ isVideoPressEnabled }
				{ ...SHARED_PROPS }
			/>
		);

		expect( screen.queryAllByRole( 'button', { name: /edit/i } ).length ).toBeGreaterThanOrEqual(
			1
		);
	} );

	test( 'should display at least one edit button for a VideoPress video on a private site', () => {
		renderWithRedux(
			<DetailItem
				item={ DUMMY_VIDEO_MEDIA }
				isVideoPressEnabled={ isVideoPressEnabled }
				isSitePrivate
				{ ...SHARED_PROPS }
			/>
		);

		expect( screen.queryAllByRole( 'button', { name: /edit/i } ).length ).toBeGreaterThanOrEqual(
			1
		);
	} );

	test( 'should display at least one edit button for an image on a public site', () => {
		renderWithRedux( <DetailItem item={ DUMMY_IMAGE_MEDIA } { ...SHARED_PROPS } /> );

		expect( screen.queryAllByRole( 'button', { name: /edit/i } ).length ).toBeGreaterThanOrEqual(
			1
		);
	} );

	test( 'should not display edit button for an image on a private site', () => {
		renderWithRedux( <DetailItem item={ DUMMY_IMAGE_MEDIA } isSitePrivate { ...SHARED_PROPS } /> );

		expect( screen.queryByRole( 'button', { name: /edit/i } ) ).not.toBeInTheDocument();
	} );

	test( 'should not display a Privacy field for an image', () => {
		renderWithRedux( <DetailItem item={ DUMMY_IMAGE_MEDIA } { ...SHARED_PROPS } /> );

		expect( screen.queryByRole( 'group', { name: 'Privacy' } ) ).not.toBeInTheDocument();
	} );

	test( 'should display a Privacy field for a video', () => {
		renderWithRedux( <DetailItem item={ DUMMY_VIDEO_MEDIA } { ...SHARED_PROPS } /> );

		expect( screen.queryByRole( 'group', { name: 'Privacy' } ) ).toBeInTheDocument();
	} );
} );
