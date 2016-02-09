/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getEditedPost } from '../selectors';

describe( 'selectors', () => {
	describe( '#getEditedPost()', () => {
		it( 'should return the original post if no revisions exist on site', () => {
			const editedPost = getEditedPost( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
					},
					sitePosts: {
						2916284: {
							841: '3d097cb7c5473c169bba0eb8e3c6cb64'
						}
					}
				},
				editor: {
					posts: {}
				}
			}, 2916284, 841 );

			expect( editedPost ).to.eql( { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' } );
		} );

		it( 'should return revisions for a new draft', () => {
			const editedPost = getEditedPost( {
				posts: {
					items: {},
					sitePosts: {}
				},
				editor: {
					posts: {
						2916284: {
							'': {
								title: 'Ribs & Chicken'
							}
						}
					}
				}
			}, 2916284 );

			expect( editedPost ).to.eql( { title: 'Ribs & Chicken' } );
		} );

		it( 'should return revisions for a draft if the original is unknown', () => {
			const editedPost = getEditedPost( {
				posts: {
					items: {},
					sitePosts: {}
				},
				editor: {
					posts: {
						2916284: {
							841: {
								title: 'Hello World!'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( editedPost ).to.eql( { title: 'Hello World!' } );
		} );

		it( 'should return revisions merged with the original post', () => {
			const editedPost = getEditedPost( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
					},
					sitePosts: {
						2916284: {
							841: '3d097cb7c5473c169bba0eb8e3c6cb64'
						}
					}
				},
				editor: {
					posts: {
						2916284: {
							841: {
								title: 'Hello World!'
							}
						}
					}
				}
			}, 2916284, 841 );

			expect( editedPost ).to.eql( { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World!' } );
		} );
	} );
} );
