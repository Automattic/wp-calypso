/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingPostCounts,
	getAllPostCounts,
	getAllPostCount,
	getMyPostCounts,
	getMyPostCount
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingPostCounts()', () => {
		it( 'should return false if no request has been made', () => {
			const isRequesting = isRequestingPostCounts( {
				posts: {
					counts: {
						requesting: {}
					}
				}
			}, 2916284, 'post' );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if a request has finished', () => {
			const isRequesting = isRequestingPostCounts( {
				posts: {
					counts: {
						requesting: {
							2916284: {
								post: false
							}
						}
					}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if a request is in progress', () => {
			const isRequesting = isRequestingPostCounts( {
				posts: {
					counts: {
						requesting: {
							2916284: {
								post: true
							}
						}
					}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.false;
		} );
	} );

	describe( '#getAllPostCounts()', () => {
		it( 'should return null if counts haven\'t been received for site', () => {
			const postCounts = getAllPostCounts( {
				posts: {
					counts: {
						all: {}
					}
				}
			}, 2916284, 'post' );

			expect( postCounts ).to.be.null;
		} );

		it( 'should return post counts for all statuses', () => {
			const postCounts = getAllPostCounts( {
				posts: {
					counts: {
						counts: {
							2916284: {
								post: {
									all: {
										publish: 2
									}
								}
							}
						}
					}
				}
			}, 2916284, 'post' )

			expect( postCounts ).to.eql( {
				publish: 2
			} );
		} );
	} );

	describe( '#getAllPostCount()', () => {
		it( 'should return post count for status', () => {
			const postCounts = getAllPostCount( {
				posts: {
					counts: {
						counts: {
							2916284: {
								post: {
									all: {
										publish: 2
									}
								}
							}
						}
					}
				}
			}, 2916284, 'post', 'publish' );

			expect( postCounts ).to.equal( 2 );
		} );
	} );

	describe( '#getMyPostCounts()', () => {
		it( 'should return null if counts haven\'t been received for site', () => {
			const postCounts = getMyPostCounts( {
				posts: {
					counts: {
						mine: {}
					}
				}
			}, 2916284, 'post' );

			expect( postCounts ).to.be.null;
		} );

		it( 'should return post counts for all statuses', () => {
			const postCounts = getMyPostCounts( {
				posts: {
					counts: {
						counts: {
							2916284: {
								post: {
									mine: {
										publish: 1
									}
								}
							}
						}
					}
				}
			}, 2916284, 'post' )

			expect( postCounts ).to.eql( {
				publish: 1
			} );
		} );
	} );

	describe( '#getMyPostCount()', () => {
		it( 'should return post count for status', () => {
			const postCounts = getMyPostCount( {
				posts: {
					counts: {
						counts: {
							2916284: {
								post: {
									mine: {
										publish: 1
									}
								}
							}
						}
					}
				}
			}, 2916284, 'post', 'publish' );

			expect( postCounts ).to.equal( 1 );
		} );
	} );
} );
