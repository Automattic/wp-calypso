/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getVideo,
	isFetchingVideo
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
	} );

	describe( '#isFetchingVideo()', () => {
		it( 'should return false if the video is not being fetched', () => {
			const isFetching = isFetchingVideo( {
				videos: {
					fetchingVideo: {
						kUJmAcSf: false
					}
				}
			}, 'kUJmAcSf' );

			expect( isFetching ).to.be.false;
		} );

		it( 'should return false if the video has never been fetched', () => {
			const isFetching = isFetchingVideo( {
				videos: {
					fetchingVideo: {
						aJnoKdwr: true
					}
				}
			}, 'kUJmAcSf' );

			expect( isFetching ).to.be.false;
		} );

		it( 'should return true if the video is being fetched', () => {
			const isFetching = isFetchingVideo( {
				videos: {
					fetchingVideo: {
						kUJmAcSf: true
					}
				}
			}, 'kUJmAcSf' );

			expect( isFetching ).to.be.true;
		} );
	} );
} );
