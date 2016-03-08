/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getVideo,
	isRequestingVideo
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getVideo()', () => {
		it( 'should return the object for the guid', () => {
			const video = getVideo( {
				videos: {
					items: {
						kUJmAcSf: { title: 'VideoPress Demo', width: 1920, height: 1080 }
					}
				}
			}, 'kUJmAcSf' );

			expect( video ).to.eql( { title: 'VideoPress Demo', width: 1920, height: 1080 } );
		} );

		it( 'should return null if no object is known with the specified guid', () => {
			const video = getVideo( {
				videos: {
					items: {
						kUJmAcSf: { title: 'VideoPress Demo', width: 1920, height: 1080 }
					}
				}
			}, 'aJnoKdwr' );

			expect( video ).to.be.null;
		} );
	} );

	describe( '#isRequestingVideo()', () => {
		it( 'should return false if the video is not being fetched', () => {
			const isRequesting = isRequestingVideo( {
				videos: {
					videoRequests: {
						kUJmAcSf: false
					}
				}
			}, 'kUJmAcSf' );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the video has never been fetched', () => {
			const isRequesting = isRequestingVideo( {
				videos: {
					videoRequests: {
						aJnoKdwr: true
					}
				}
			}, 'kUJmAcSf' );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the video is being fetched', () => {
			const isRequesting = isRequestingVideo( {
				videos: {
					videoRequests: {
						kUJmAcSf: true
					}
				}
			}, 'kUJmAcSf' );

			expect( isRequesting ).to.be.true;
		} );
	} );
} );
