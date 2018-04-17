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
import { EditorMediaModalDetailItem as DetailItem } from '../detail-item';
import { useSandbox } from 'test/helpers/use-sinon';

jest.mock( 'post-editor/media-modal/detail/detail-fields', () =>
	require( 'components/empty-component' )
);
jest.mock( 'post-editor/media-modal/detail/detail-file-info', () =>
	require( 'components/empty-component' )
);

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
	translate: str => str,
};

describe( 'EditorMediaModalDetailItem', () => {
	let isVideoPressEnabled;

	useSandbox( sandbox => {
		isVideoPressEnabled = sandbox.stub().returns( true );
	} );

	test( 'should display edit button for a VideoPress video on a public site', () => {
		const tree = shallow(
			<DetailItem
				item={ DUMMY_VIDEO_MEDIA }
				isVideoPressEnabled={ isVideoPressEnabled }
				{ ...SHARED_PROPS }
			/>
		);

		const editButton = tree.find( '.editor-media-modal-detail__edit' );

		// 2 Edit buttons are rendered. It's recommended te have exact value tests.
		// Not sure whethur to change this to
		// expect( editButton ).to.have.length(2);
		expect( editButton ).to.have.length.at.least( 1 );
	} );

	test( 'should display edit button for a VideoPress video on a private site', () => {
		const tree = shallow(
			<DetailItem
				item={ DUMMY_VIDEO_MEDIA }
				isVideoPressEnabled={ isVideoPressEnabled }
				isPrivateSite={ true }
				{ ...SHARED_PROPS }
			/>
		);

		const editButton = tree.find( '.editor-media-modal-detail__edit' );

		expect( editButton ).to.have.length.at.least( 1 );
	} );

	test( 'should display edit button for an image on a public site', () => {
		const tree = shallow( <DetailItem item={ DUMMY_IMAGE_MEDIA } { ...SHARED_PROPS } /> );

		const editButton = tree.find( '.editor-media-modal-detail__edit' );

		expect( editButton ).to.have.length.at.least( 1 );
	} );

	test( 'should not display edit button for an image on a private site', () => {
		const tree = shallow(
			<DetailItem item={ DUMMY_IMAGE_MEDIA } isPrivateSite={ true } { ...SHARED_PROPS } />
		);

		const editButton = tree.find( '.editor-media-modal-detail__edit' );

		expect( editButton ).to.have.length( 0 );
	} );
} );
