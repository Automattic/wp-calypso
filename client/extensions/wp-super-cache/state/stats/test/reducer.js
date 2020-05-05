/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	WP_SUPER_CACHE_DELETE_CACHE_SUCCESS,
	WP_SUPER_CACHE_DELETE_FILE,
	WP_SUPER_CACHE_DELETE_FILE_FAILURE,
	WP_SUPER_CACHE_DELETE_FILE_SUCCESS,
	WP_SUPER_CACHE_GENERATE_STATS,
	WP_SUPER_CACHE_GENERATE_STATS_FAILURE,
	WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
} from '../../action-types';
import reducer, { generating } from '../reducer';
import { DESERIALIZE, SERIALIZE } from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	describe( 'generating()', () => {
		const previousState = deepFreeze( {
			[ primarySiteId ]: true,
		} );

		test( 'should default to an empty object', () => {
			const state = generating( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should set generating value to true if request in progress', () => {
			const state = generating( undefined, {
				type: WP_SUPER_CACHE_GENERATE_STATS,
				siteId: primarySiteId,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: true,
			} );
		} );

		test( 'should accumulate generating values', () => {
			const state = generating( previousState, {
				type: WP_SUPER_CACHE_GENERATE_STATS,
				siteId: secondarySiteId,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		test( 'should set generating value to false if request finishes successfully', () => {
			const state = generating( previousState, {
				type: WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
				siteId: primarySiteId,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		test( 'should set generating value to false if request finishes with failure', () => {
			const state = generating( previousState, {
				type: WP_SUPER_CACHE_GENERATE_STATS_FAILURE,
				siteId: primarySiteId,
			} );

			expect( state ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		test( 'should not persist state', () => {
			const state = generating( previousState, {
				type: SERIALIZE,
			} );

			expect( state ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const state = generating( previousState, {
				type: DESERIALIZE,
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( 'deleting()', () => {
		const previousState = deepFreeze( {
			deleting: {
				[ primarySiteId ]: true,
			},
		} );

		test( 'should default to an empty object', () => {
			const state = reducer( undefined, {} );

			expect( state.deleting ).to.eql( {} );
		} );

		test( 'should set deleting value to true if request in progress', () => {
			const state = reducer( undefined, {
				type: WP_SUPER_CACHE_DELETE_FILE,
				siteId: primarySiteId,
			} );

			expect( state.deleting ).to.eql( {
				[ primarySiteId ]: true,
			} );
		} );

		test( 'should accumulate deleting values', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_DELETE_FILE,
				siteId: secondarySiteId,
			} );

			expect( state.deleting ).to.eql( {
				[ primarySiteId ]: true,
				[ secondarySiteId ]: true,
			} );
		} );

		test( 'should set deleting value to false if request finishes successfully', () => {
			const oldState = deepFreeze( {
				items: {
					[ primarySiteId ]: {
						wpcache: {
							cached: 2,
							cached_list: {
								'wordpress.com/cached-file': {
									files: 2,
									lower_age: 5500,
									upper_age: 10000,
								},
							},
							expired: 0,
							expired_list: {},
							fsize: 0,
						},
					},
				},
			} );
			const state = reducer( oldState, {
				type: WP_SUPER_CACHE_DELETE_FILE_SUCCESS,
				siteId: primarySiteId,
				url: 'wordpress.com/cached-file',
				isSupercache: false,
				isCached: true,
			} );

			expect( state.deleting ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		test( 'should set deleting value to false if request finishes with failure', () => {
			const state = reducer( previousState, {
				type: WP_SUPER_CACHE_DELETE_FILE_FAILURE,
				siteId: primarySiteId,
			} );

			expect( state.deleting ).to.eql( {
				[ primarySiteId ]: false,
			} );
		} );

		test( 'should not persist state', () => {
			const state = reducer( previousState, {
				type: SERIALIZE,
			} );

			expect( state.deleting ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const state = reducer( previousState, {
				type: DESERIALIZE,
			} );

			expect( state.deleting ).to.eql( {} );
		} );
	} );

	describe( 'items()', () => {
		describe( 'WP_SUPER_CACHE_GENERATE_STATS_SUCCESS', () => {
			const primaryStats = { generated: 1493997829 };
			const secondaryStats = { generated: 0 };
			const previousState = deepFreeze( {
				items: {
					[ primarySiteId ]: primaryStats,
				},
			} );

			test( 'should default to an empty object', () => {
				const state = reducer( undefined, {} );

				expect( state.items ).to.eql( {} );
			} );

			test( 'should index stats by site ID', () => {
				const state = reducer( undefined, {
					type: WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
					siteId: primarySiteId,
					stats: primaryStats,
				} );

				expect( state.items ).to.eql( {
					[ primarySiteId ]: primaryStats,
				} );
			} );

			test( 'should accumulate stats', () => {
				const state = reducer( previousState, {
					type: WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
					siteId: secondarySiteId,
					stats: secondaryStats,
				} );

				expect( state.items ).to.eql( {
					[ primarySiteId ]: primaryStats,
					[ secondarySiteId ]: secondaryStats,
				} );
			} );

			test( 'should override previous stats of same site ID', () => {
				const state = reducer( previousState, {
					type: WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
					siteId: primarySiteId,
					stats: secondaryStats,
				} );

				expect( state.items ).to.eql( {
					[ primarySiteId ]: secondaryStats,
				} );
			} );

			test( 'should accumulate new stats and overwrite existing ones for the same site ID', () => {
				const newStats = {
					generated: 1493997829,
					supercache: {},
				};
				const state = reducer( previousState, {
					type: WP_SUPER_CACHE_GENERATE_STATS_SUCCESS,
					siteId: primarySiteId,
					stats: newStats,
				} );

				expect( state.items ).to.eql( {
					[ primarySiteId ]: newStats,
				} );
			} );

			test( 'should persist state', () => {
				const state = reducer( previousState, {
					type: SERIALIZE,
				} );

				expect( state.root().items ).to.eql( {
					[ primarySiteId ]: primaryStats,
				} );
			} );

			test( 'should load valid persisted state', () => {
				const state = reducer( previousState, {
					type: DESERIALIZE,
				} );

				expect( state.items ).to.eql( {
					[ primarySiteId ]: primaryStats,
				} );
			} );

			test( 'should not load invalid persisted state', () => {
				const previousInvalidState = deepFreeze( {
					items: {
						[ primarySiteId ]: 2,
					},
				} );
				const state = reducer( previousInvalidState, {
					type: DESERIALIZE,
				} );

				expect( state.items ).to.eql( {} );
			} );
		} );

		describe( 'WP_SUPER_CACHE_DELETE_CACHE_SUCCESS', () => {
			const previousState = deepFreeze( {
				items: {
					[ primarySiteId ]: {
						supercache: {
							cached: 2,
							cached_list: {
								'wordpress.com/supercache/cached-file': {
									files: 2,
									lower_age: 5500,
									upper_age: 10000,
								},
							},
							expired: 4,
							expired_list: {
								'wordpress.com/supercache/expired-file': {
									files: 4,
									lower_age: 535937,
									upper_age: 538273,
								},
							},
							fsize: 58272,
						},
						wpcache: {
							cached: 3,
							cached_list: {
								'wordpress.com/cached-file': {
									files: 3,
									lower_age: 5500,
									upper_age: 10000,
								},
							},
							expired: 1,
							expired_list: {
								'wordpress.com/expired-file': {
									files: 1,
									lower_age: 535937,
									upper_age: 538273,
								},
							},
							fsize: 58272,
						},
					},
				},
			} );

			test( 'should clear cache and supercache expired count and files list on expired cache clear', () => {
				const state = reducer( previousState, {
					type: WP_SUPER_CACHE_DELETE_CACHE_SUCCESS,
					siteId: primarySiteId,
					deleteExpired: true,
				} );

				expect( state.items ).to.eql( {
					[ primarySiteId ]: {
						supercache: {
							cached: 2,
							cached_list: {
								'wordpress.com/supercache/cached-file': {
									files: 2,
									lower_age: 5500,
									upper_age: 10000,
								},
							},
							expired: 0,
							expired_list: {},
							fsize: 58272,
						},
						wpcache: {
							cached: 3,
							cached_list: {
								'wordpress.com/cached-file': {
									files: 3,
									lower_age: 5500,
									upper_age: 10000,
								},
							},
							expired: 0,
							expired_list: {},
							fsize: 58272,
						},
					},
				} );
			} );

			test( 'should clear cache and supercache cached and expired count and files list on cache clear', () => {
				const state = reducer( previousState, {
					type: WP_SUPER_CACHE_DELETE_CACHE_SUCCESS,
					siteId: primarySiteId,
					deleteExpired: false,
				} );

				expect( state.items ).to.eql( {
					[ primarySiteId ]: {
						supercache: {
							cached: 0,
							cached_list: {},
							expired: 0,
							expired_list: {},
							fsize: 58272,
						},
						wpcache: {
							cached: 0,
							cached_list: {},
							expired: 0,
							expired_list: {},
							fsize: 58272,
						},
					},
				} );
			} );
		} );

		describe( 'WP_SUPER_CACHE_DELETE_FILE_SUCCESS', () => {
			test( 'should update supercache expired count and expired files on file remove', () => {
				const previousState = deepFreeze( {
					items: {
						[ primarySiteId ]: {
							supercache: {
								cached: 2,
								cached_list: {
									'wordpress.com/cached-file': {
										files: 2,
										lower_age: 5500,
										upper_age: 10000,
									},
								},
								expired: 4,
								expired_list: {
									'wordpress.com/expired-file': {
										files: 4,
										lower_age: 535937,
										upper_age: 538273,
									},
								},
								fsize: 58272,
							},
						},
					},
				} );
				const state = reducer( previousState, {
					type: WP_SUPER_CACHE_DELETE_FILE_SUCCESS,
					siteId: primarySiteId,
					url: 'wordpress.com/expired-file',
					isSupercache: true,
					isCached: false,
				} );

				expect( state.items ).to.eql( {
					[ primarySiteId ]: {
						supercache: {
							cached: 2,
							cached_list: {
								'wordpress.com/cached-file': {
									files: 2,
									lower_age: 5500,
									upper_age: 10000,
								},
							},
							expired: 0,
							expired_list: {},
							fsize: 58272,
						},
					},
				} );
			} );

			test( 'should update supercache cached count and cached files on file remove', () => {
				const previousState = deepFreeze( {
					items: {
						[ primarySiteId ]: {
							supercache: {
								cached: 2,
								cached_list: {
									'wordpress.com/cached-file': {
										files: 2,
										lower_age: 5500,
										upper_age: 10000,
									},
								},
								expired: 4,
								expired_list: {
									'wordpress.com/expired-file': {
										files: 4,
										lower_age: 535937,
										upper_age: 538273,
									},
								},
								fsize: 58272,
							},
						},
					},
				} );
				const state = reducer( previousState, {
					type: WP_SUPER_CACHE_DELETE_FILE_SUCCESS,
					siteId: primarySiteId,
					url: 'wordpress.com/cached-file',
					isSupercache: true,
					isCached: true,
				} );

				expect( state.items ).to.eql( {
					[ primarySiteId ]: {
						supercache: {
							cached: 0,
							cached_list: {},
							expired: 4,
							expired_list: {
								'wordpress.com/expired-file': {
									files: 4,
									lower_age: 535937,
									upper_age: 538273,
								},
							},
							fsize: 58272,
						},
					},
				} );
			} );

			test( 'should update wpcache expired count and expired files on file remove', () => {
				const previousState = deepFreeze( {
					items: {
						[ primarySiteId ]: {
							wpcache: {
								cached: 2,
								cached_list: {
									'wordpress.com/cached-file': {
										files: 2,
										lower_age: 5500,
										upper_age: 10000,
									},
								},
								expired: 4,
								expired_list: {
									'wordpress.com/expired-file': {
										files: 4,
										lower_age: 535937,
										upper_age: 538273,
									},
								},
								fsize: 58272,
							},
						},
					},
				} );
				const state = reducer( previousState, {
					type: WP_SUPER_CACHE_DELETE_FILE_SUCCESS,
					siteId: primarySiteId,
					url: 'wordpress.com/expired-file',
					isSupercache: false,
					isCached: false,
				} );

				expect( state.items ).to.eql( {
					[ primarySiteId ]: {
						wpcache: {
							cached: 2,
							cached_list: {
								'wordpress.com/cached-file': {
									files: 2,
									lower_age: 5500,
									upper_age: 10000,
								},
							},
							expired: 0,
							expired_list: {},
							fsize: 58272,
						},
					},
				} );
			} );

			test( 'should update wpcache cached count and cached files on file remove', () => {
				const previousState = deepFreeze( {
					items: {
						[ primarySiteId ]: {
							wpcache: {
								cached: 2,
								cached_list: {
									'wordpress.com/cached-file': {
										files: 2,
										lower_age: 5500,
										upper_age: 10000,
									},
								},
								expired: 4,
								expired_list: {
									'wordpress.com/expired-file': {
										files: 4,
										lower_age: 535937,
										upper_age: 538273,
									},
								},
								fsize: 58272,
							},
						},
					},
				} );
				const state = reducer( previousState, {
					type: WP_SUPER_CACHE_DELETE_FILE_SUCCESS,
					siteId: primarySiteId,
					url: 'wordpress.com/cached-file',
					isSupercache: false,
					isCached: true,
				} );

				expect( state.items ).to.eql( {
					[ primarySiteId ]: {
						wpcache: {
							cached: 0,
							cached_list: {},
							expired: 4,
							expired_list: {
								'wordpress.com/expired-file': {
									files: 4,
									lower_age: 535937,
									upper_age: 538273,
								},
							},
							fsize: 58272,
						},
					},
				} );
			} );
		} );
	} );
} );
