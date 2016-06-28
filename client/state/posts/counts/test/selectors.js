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
	getMyPostCount,
	getNormalizedPostCounts,
	getNormalizedMyPostCounts
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
			}, 2916284, 'post' );

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
			}, 2916284, 'post' );

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

	describe( 'getNormalizedPostCounts()', () => {
		it( 'should return normalized post counts using selector', () => {
			const postCounts = getNormalizedPostCounts( {
				posts: {
					counts: {
						counts: {
							2916284: {
								post: {
									mine: {
										publish: 1,
										'private': 1,
										draft: 2,
										pending: 1,
										future: 2,
										badstatus: 10
									}
								}
							}
						}
					}
				}
			}, 2916284, 'post', getMyPostCounts );

			expect( postCounts ).to.eql( {
				publish: 2,
				draft: 3,
				future: 2,
				trash: 0
			} );
		} );

		it( 'should default to returning all counts', () => {
			const postCounts = getNormalizedPostCounts( {
				posts: {
					counts: {
						counts: {
							2916284: {
								post: {
									all: {
										publish: 1
									}
								}
							}
						}
					}
				}
			}, 2916284, 'post' );

			expect( postCounts ).to.eql( {
				publish: 1,
				draft: 0,
				future: 0,
				trash: 0
			} );
		} );
	} );

	describe( 'getNormalizedMyPostCounts()', () => {
		it( 'should return normalized post counts for mine counts', () => {
			const postCounts = getNormalizedMyPostCounts( {
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
			}, 2916284, 'post' );

			expect( postCounts ).to.eql( {
				publish: 1,
				draft: 0,
				future: 0,
				trash: 0
			} );
		} );
	} );
} );
