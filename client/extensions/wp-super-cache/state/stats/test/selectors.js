/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getStats, isDeletingFile, isGeneratingStats } from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'isGeneratingStats()', () => {
		test( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: undefined,
					},
				},
			};
			const isGenerating = isGeneratingStats( state, primarySiteId );

			expect( isGenerating ).to.be.false;
		} );

		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							generating: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isGenerating = isGeneratingStats( state, secondarySiteId );

			expect( isGenerating ).to.be.false;
		} );

		test( 'should return false if the stats are not generating', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							generating: {
								[ primarySiteId ]: false,
							},
						},
					},
				},
			};
			const isGenerating = isGeneratingStats( state, primarySiteId );

			expect( isGenerating ).to.be.false;
		} );

		test( 'should return true if the stats are generating', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							generating: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isGenerating = isGeneratingStats( state, primarySiteId );

			expect( isGenerating ).to.be.true;
		} );
	} );

	describe( 'getStats()', () => {
		const primaryStats = { generated: 1493997829 };

		test( 'should return null if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				},
			};
			const stats = getStats( state, primarySiteId );

			expect( stats ).to.be.null;
		} );

		test( 'should return null if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							items: {
								[ primarySiteId ]: primaryStats,
							},
						},
					},
				},
			};
			const stats = getStats( state, secondarySiteId );

			expect( stats ).to.be.null;
		} );

		test( 'should return the stats for a siteId', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							items: {
								[ primarySiteId ]: primaryStats,
							},
						},
					},
				},
			};
			const stats = getStats( state, primarySiteId );

			expect( stats ).to.eql( primaryStats );
		} );
	} );

	describe( 'isDeletingFile()', () => {
		test( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				},
			};
			const isDeleting = isDeletingFile( state, primarySiteId );

			expect( isDeleting ).to.be.false;
		} );

		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							deleting: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isDeleting = isDeletingFile( state, secondarySiteId );

			expect( isDeleting ).to.be.false;
		} );

		test( 'should return false if the file is not being deleted', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							deleting: {
								[ primarySiteId ]: false,
							},
						},
					},
				},
			};
			const isDeleting = isDeletingFile( state, primarySiteId );

			expect( isDeleting ).to.be.false;
		} );

		test( 'should return true if the file is being deleted', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							deleting: {
								[ primarySiteId ]: true,
							},
						},
					},
				},
			};
			const isDeleting = isDeletingFile( state, primarySiteId );

			expect( isDeleting ).to.be.true;
		} );
	} );
} );
