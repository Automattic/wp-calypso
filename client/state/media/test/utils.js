/**
 * External dependencies
 */
import { expect } from 'chai';
import { forEach } from 'lodash';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import { useSandbox } from 'test/helpers/use-sinon';
import { createTransientMedia, isTransientMedia } from '../utils';

describe( 'utils', () => {
	describe( 'createTransientMedia()', () => {
		function assertExpectedTransient( transientMedia, properties ) {
			expect( transientMedia.ID ).to.match( /^media\d+$/ );
			expect( transientMedia.date ).to.be.gt( ( new Date() ).toISOString() );
			forEach( properties, ( value, key ) => {
				expect( transientMedia[ key ] ).to.equal( value );
			} );
		}

		context( 'URL', () => {
			it( 'should create transient media object', () => {
				const transientMedia = createTransientMedia( 'https://wordpress.com/i/stats-icon.gif' );

				assertExpectedTransient( transientMedia, {
					file: 'https://wordpress.com/i/stats-icon.gif',
					title: 'stats-icon.gif',
					extension: 'gif',
					mime_type: 'image/gif'
				} );
			} );
		} );

		context( 'window.File', () => {
			useFakeDom( () => {
				window.FileList = function() {};
				window.URL = {};
			} );

			useSandbox( ( sandbox ) => window.URL.createObjectURL = sandbox.stub() );

			it( 'should create transient media object', () => {
				const transientMedia = createTransientMedia( new window.File( [], 'example.gif', {
					type: 'image/gif'
				} ) );

				assertExpectedTransient( transientMedia, {
					file: 'example.gif',
					title: 'example.gif',
					extension: 'gif',
					mime_type: 'image/gif'
				} );
			} );
		} );
	} );

	describe( 'isTransientMedia()', () => {
		it( 'should return false if passed a falsey value', () => {
			const isTransient = isTransientMedia();

			expect( isTransient ).to.be.false;
		} );

		it( 'should return false if passed a REST API media object', () => {
			const isTransient = isTransientMedia( {
				ID: 44,
				title: 'flower'
			} );

			expect( isTransient ).to.be.false;
		} );

		it( 'should return true if passed a transient media object', () => {
			const isTransient = isTransientMedia( {
				ID: 'media1',
				title: 'flower'
			} );

			expect( isTransient ).to.be.true;
		} );
	} );
} );
