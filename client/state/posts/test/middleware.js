/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	POST_EDIT
} from 'state/action-types';
import { onTermsReceive } from '../middleware';
import PostQueryManager from 'lib/query-manager/post';

describe( 'middleware', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( 'onTermsReceive()', () => {
		it( 'postEdit should not dispatch when no matching post exists', () => {
			const action = {
				site: 2916284,
				taxonomy: 'category',
				postId: 111,
				terms: [ {
					ID: 777,
					name: 'chicken'
				} ]
			};
			onTermsReceive( spy, { posts: { queries: {}, items: {}, edits: {} } }, action );
			expect( spy ).to.not.have.been.called;
		} );

		it( 'should not dispatch a postEdit when a temporary term is added', () => {
			const action = {
				siteId: 2916284,
				taxonomy: 'category',
				postId: 841,
				terms: [ {
					ID: 'temporary1',
					name: 'meat'
				} ]
			};

			onTermsReceive( spy, { posts: { queries: {}, items: {}, edits: {} } }, action );
			expect( spy ).to.not.have.been.called;
		} );

		it( 'should dispatch a postEdit when a post exists', () => {
			const action = {
				siteId: 2916284,
				taxonomy: 'category',
				postId: 841,
				terms: [ {
					ID: 777,
					name: 'meat'
				} ]
			};

			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Ribs &amp; Chicken'
			};

			const state = deepFreeze( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new PostQueryManager( {
							items: { 841: postObject }
						} )
					},
					edits: {}
				}
			} );

			onTermsReceive( spy, state, action );
			expect( spy ).to.have.been.calledWith( {
				type: POST_EDIT,
				post: {
					terms: {
						category: [ {
							ID: 777,
							name: 'meat'
						} ]
					}
				},
				siteId: 2916284,
				postId: 841
			} );
		} );

		it( 'should dispatch a postEdit with accumulated terms by taxonomy', () => {
			const action = {
				siteId: 2916284,
				taxonomy: 'category',
				postId: 841,
				terms: [ {
					ID: 790,
					name: 'yummy'
				} ]
			};

			const postObject = {
				ID: 841,
				site_ID: 2916284,
				global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64',
				title: 'Ribs &amp; Chicken',
				terms: {
					category: {
						meat: {
							ID: 777,
							name: 'meat'
						}
					}
				}
			};

			const state = deepFreeze( {
				posts: {
					items: {
						'3d097cb7c5473c169bba0eb8e3c6cb64': [ 2916284, 841 ]
					},
					queries: {
						2916284: new PostQueryManager( {
							items: { 841: postObject }
						} )
					},
					edits: {}
				}
			} );

			onTermsReceive( spy, state, action );
			expect( spy ).to.have.been.calledWith( {
				type: POST_EDIT,
				post: {
					terms: {
						category: [ {
							ID: 777,
							name: 'meat'
						}, {
							ID: 790,
							name: 'yummy'
						} ]
					}
				},
				siteId: 2916284,
				postId: 841
			} );
		} );
	} );
} );
