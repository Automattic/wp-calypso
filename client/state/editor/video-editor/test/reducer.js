import {
	VIDEO_EDITOR_SET_POSTER_URL,
	VIDEO_EDITOR_SHOW_ERROR,
	VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
} from 'calypso/state/action-types';
import reducer, { showError, uploadProgress, url } from '../reducer';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [ 'showError', 'uploadProgress', 'url' ] )
		);
	} );

	describe( '#url()', () => {
		const posterUrl = 'https://i1.wp.com/videos.files.wordpress.com/guid/thumbnail.jpg?ssl=1';

		test( 'should default to null', () => {
			const state = url( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should change to poster url on successful update', () => {
			const state = url( undefined, {
				type: VIDEO_EDITOR_SET_POSTER_URL,
				posterUrl,
			} );

			expect( state ).toEqual( posterUrl );
		} );

		test( 'should change to null on some other state change', () => {
			const state = url( undefined, {
				type: VIDEO_EDITOR_SHOW_ERROR,
			} );

			expect( state ).toBeNull();
		} );
	} );

	describe( '#uploadProgress()', () => {
		const percentage = 50;

		test( 'should default to null', () => {
			const state = uploadProgress( undefined, {} );

			expect( state ).toBeNull();
		} );

		test( 'should change to upload percentage on successful update', () => {
			const state = uploadProgress( undefined, {
				type: VIDEO_EDITOR_SHOW_UPLOAD_PROGRESS,
				percentage,
			} );

			expect( state ).toEqual( percentage );
		} );

		test( 'should change to null on some other state change', () => {
			const state = uploadProgress( undefined, {
				type: VIDEO_EDITOR_SHOW_ERROR,
			} );

			expect( state ).toBeNull();
		} );
	} );

	describe( '#showError()', () => {
		test( 'should default to false', () => {
			const state = showError( undefined, {} );

			expect( state ).toBe( false );
		} );

		test( 'should change to true on failed update', () => {
			const state = showError( undefined, {
				type: VIDEO_EDITOR_SHOW_ERROR,
			} );

			expect( state ).toBe( true );
		} );

		test( 'should change to false on some other state change', () => {
			const state = showError( undefined, {
				type: VIDEO_EDITOR_SET_POSTER_URL,
			} );

			expect( state ).toBe( false );
		} );
	} );
} );
