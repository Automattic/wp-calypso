/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingPostTypes,
	getPostTypes,
	getPostType,
	postTypeSupports,
	isPostTypeSupported
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingPostTypes()', () => {
		it( 'should return false if the site is not tracked', () => {
			const isRequesting = isRequestingPostTypes( {
				postTypes: {
					requesting: {}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site is not fetching', () => {
			const isRequesting = isRequestingPostTypes( {
				postTypes: {
					requesting: {
						2916284: false
					}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the site is fetching', () => {
			const isRequesting = isRequestingPostTypes( {
				postTypes: {
					requesting: {
						2916284: true
					}
				}
			}, 2916284 );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getPostTypes()', () => {
		it( 'should return null if the site is not tracked', () => {
			const postTypes = getPostTypes( {
				postTypes: {
					items: {}
				}
			}, 2916284 );

			expect( postTypes ).to.be.null;
		} );

		it( 'should return the post types for a site', () => {
			const postTypes = getPostTypes( {
				postTypes: {
					items: {
						2916284: {
							post: { name: 'post', label: 'Posts' }
						}
					}
				}
			}, 2916284 );

			expect( postTypes ).to.eql( {
				post: { name: 'post', label: 'Posts' }
			} )
		} );
	} );

	describe( '#getPostType()', () => {
		it( 'should return null if there are no known post types for the site', () => {
			const postType = getPostType( {
				postTypes: {
					items: {}
				}
			}, 2916284, 'post' );

			expect( postType ).to.be.null;
		} );

		it( 'should return null if the post type slug is unknown for the site', () => {
			const postType = getPostType( {
				postTypes: {
					items: {
						2916284: {}
					}
				}
			}, 2916284, 'post' );

			expect( postType ).to.be.null;
		} );

		it( 'should return the post type', () => {
			const postType = getPostType( {
				postTypes: {
					items: {
						2916284: {
							post: { name: 'post', label: 'Posts' }
						}
					}
				}
			}, 2916284, 'post' );

			expect( postType ).to.eql( { name: 'post', label: 'Posts' } );
		} );
	} );

	describe( 'postTypeSupports()', () => {
		it( 'should return true for post publicize if type is unknown', () => {
			const isSupported = postTypeSupports( {
				postTypes: {
					items: {}
				}
			}, 2916284, 'post', 'publicize' );

			expect( isSupported ).to.be.true;
		} );

		it( 'should return true for post publicize even if type is known', () => {
			const isSupported = postTypeSupports( {
				postTypes: {
					items: {
						2916284: {
							post: {
								name: 'post',
								label: 'Posts',
								supports: {
									publicize: false
								}
							}
						}
					}
				}
			}, 2916284, 'post', 'publicize' );

			expect( isSupported ).to.be.true;
		} );

		it( 'should return null if post type is not known', () => {
			const isSupported = postTypeSupports( {
				postTypes: {
					items: {}
				}
			}, 2916284, 'jetpack-portfolio', 'publicize' );

			expect( isSupported ).to.be.null;
		} );

		it( 'should return false if post type support omits feature', () => {
			const isSupported = postTypeSupports( {
				postTypes: {
					items: {
						2916284: {
							'jetpack-testimonial': {
								name: 'jetpack-testimonial',
								label: 'Testimonials',
								supports: {}
							}
						}
					}
				}
			}, 2916284, 'jetpack-testimonial', 'publicize' );

			expect( isSupported ).to.be.false;
		} );

		it( 'should return true if post type supports feature', () => {
			const isSupported = postTypeSupports( {
				postTypes: {
					items: {
						2916284: {
							'jetpack-portfolio': {
								name: 'jetpack-portfolio',
								label: 'Projects',
								supports: {
									publicize: true
								}
							}
						}
					}
				}
			}, 2916284, 'jetpack-portfolio', 'publicize' );

			expect( isSupported ).to.be.true;
		} );

		it( 'should return hard-coded fallback values for unknown post types', () => {
			const state = { postTypes: { items: {} } };

			expect( postTypeSupports( state, 2916284, 'page', 'publicize' ) ).to.be.false;
		} );
	} );

	describe( 'isPostTypeSupported', () => {
		it( 'should return null if the site post types are not known', () => {
			const isSupported = isPostTypeSupported( {
				postTypes: {
					items: {}
				}
			}, 2916284, 'post' );

			expect( isSupported ).to.be.null;
		} );

		it( 'should return false if the post type is not supported', () => {
			const isSupported = isPostTypeSupported( {
				postTypes: {
					items: {
						2916284: {
							post: { name: 'post', label: 'Posts' }
						}
					}
				}
			}, 2916284, 'unknown-type' );

			expect( isSupported ).to.be.false;
		} );

		it( 'should return true if the post type is supported', () => {
			const isSupported = isPostTypeSupported( {
				postTypes: {
					items: {
						2916284: {
							post: { name: 'post', label: 'Posts' }
						}
					}
				}
			}, 2916284, 'post' );

			expect( isSupported ).to.be.true;
		} );
	} );
} );
