/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
//import { get, partial } from 'lodash';

/**
 * Internal dependencies
 */
import { getRecommendedExperience, supportedEnginesForMimeType } from '../file-type-detection';

const XML_EXPORT_FILE = Object.freeze( {
	name: 'export-file.xml',
	type: 'text/xml',
} );

const ZIP_EXPORT_FILE = Object.freeze( {
	name: 'export-file.zip',
	type: 'application/zip',
} );

const PNG_FILE = Object.freeze( {
	name: 'some-image.png',
	type: 'image/png',
} );

const MP4_FILE = Object.freeze( {
	name: 'some-video.mp4',
	type: 'video/mp4',
} );

const UNSUPPORTED_MIME_TYPE = 'some/gibberish';
const UNSUPPORTED_FILE = Object.freeze( {
	name: 'export-file.dat',
	type: UNSUPPORTED_MIME_TYPE,
} );

describe( 'Importer file type detection', () => {
	describe( 'Supported engines for mime type', () => {
		test( 'Should return empty for unsupported type', () => {
			expect( supportedEnginesForMimeType( UNSUPPORTED_MIME_TYPE ) ).to.be.an( 'array' ).that.is
				.empty;
		} );

		test( 'Should return squarespace & wordpress for text/xml', () => {
			expect( supportedEnginesForMimeType( 'text/xml' ) ).to.eql( [ 'wordpress', 'squarespace' ] );
		} );

		test( 'Should return wordpress for application/zip', () => {
			expect( supportedEnginesForMimeType( 'application/zip' ) ).to.eql( [ 'wordpress' ] );
		} );
	} );

	describe( 'Recommended Experience for upload file', () => {
		test( 'Should recommend calypso wordpress importer for xml file when no engine is selected', () => {
			expect( getRecommendedExperience( XML_EXPORT_FILE ) ).to.eql( {
				ui: 'calypso-importer',
				engine: 'wordpress',
			} );
		} );

		test( 'Should recommend calypso wordpress importer for xml file when wordpress engine is selected', () => {
			expect( getRecommendedExperience( XML_EXPORT_FILE, 'wordpress' ) ).to.eql( {
				ui: 'calypso-importer',
				engine: 'wordpress',
			} );
		} );

		test( 'Should recommend calypso wordpress importer for zip file when no engine is selected', () => {
			expect( getRecommendedExperience( ZIP_EXPORT_FILE ) ).to.eql( {
				ui: 'calypso-importer',
				engine: 'wordpress',
			} );
		} );

		test( 'Should recommend calypso wordpress importer for zip file when wordpress engine is selected', () => {
			expect( getRecommendedExperience( ZIP_EXPORT_FILE, 'wordpress' ) ).to.eql( {
				ui: 'calypso-importer',
				engine: 'wordpress',
			} );
		} );

		// @TODO does squarespace support zips?
		test( 'Should recommend calypso wordpress importer for zip file when squarespace engine is selected', () => {
			expect( getRecommendedExperience( ZIP_EXPORT_FILE, 'wordpress' ) ).to.eql( {
				ui: 'calypso-importer',
				engine: 'wordpress',
			} );
		} );

		test( 'Should recommend calypso squarespace importer for xml file when squarespace engine is selected', () => {
			expect( getRecommendedExperience( XML_EXPORT_FILE, 'squarespace' ) ).to.eql( {
				ui: 'calypso-importer',
				engine: 'squarespace',
			} );
		} );

		test( 'Should recommend calypso media library for image file when no engine is selected', () => {
			expect( getRecommendedExperience( PNG_FILE ) ).to.eql( {
				ui: 'calypso-medialib',
				type: 'image',
			} );
		} );

		test( 'Should recommend calypso media library for image file when wordpress engine is selected', () => {
			expect( getRecommendedExperience( PNG_FILE, 'wordpress' ) ).to.eql( {
				ui: 'calypso-medialib',
				type: 'image',
			} );
		} );

		test( 'Should recommend calypso media library for video file when no engine is selected', () => {
			expect( getRecommendedExperience( MP4_FILE ) ).to.eql( {
				ui: 'calypso-medialib',
				type: 'video',
			} );
		} );

		test( 'Should recommend calypso media library for video file when wordpress engine is selected', () => {
			expect( getRecommendedExperience( MP4_FILE, 'wordpress' ) ).to.eql( {
				ui: 'calypso-medialib',
				type: 'video',
			} );
		} );

		test( 'Should recommend calypso fallback page for unsupported file when wordpress engine is selected', () => {
			expect( getRecommendedExperience( UNSUPPORTED_FILE, 'wordpress' ) ).to.eql( {
				ui: 'calypso-fallback',
			} );
		} );

		test( 'Should recommend calypso fallback page for unsupported file when no engine is selected', () => {
			expect( getRecommendedExperience( UNSUPPORTED_FILE ) ).to.eql( {
				ui: 'calypso-fallback',
			} );
		} );
	} );
} );
