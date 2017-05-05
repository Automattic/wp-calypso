/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getStats,
	getStatsGenerationStatus,
	isGeneratingStats,
	isStatsGenerationSuccessful,
} from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'isGeneratingStats()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				}
			};
			const isGenerating = isGeneratingStats( state, primarySiteId );

			expect( isGenerating ).to.be.false;
		} );

		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							generateStatus: {
								[ primarySiteId ]: { generating: true, status: 'pending' }
							}
						}
					}
				}
			};
			const isGenerating = isGeneratingStats( state, secondarySiteId );

			expect( isGenerating ).to.be.false;
		} );

		it( 'should return false if the stats are not generating', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							generateStatus: {
								[ primarySiteId ]: { generating: false, status: 'success' }
							}
						}
					}
				}
			};
			const isGenerating = isGeneratingStats( state, primarySiteId );

			expect( isGenerating ).to.be.false;
		} );

		it( 'should return true if the stats are generating', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							generateStatus: {
								[ primarySiteId ]: { generating: true, status: 'pending' }
							}
						}
					}
				}
			};
			const isGenerating = isGeneratingStats( state, primarySiteId );

			expect( isGenerating ).to.be.true;
		} );
	} );

	describe( 'isStatsGenerationSuccessful()', () => {
		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							generateStatus: {
								[ primarySiteId ]: { generating: true, status: 'pending' }
							}
						}
					}
				}
			};
			const isSuccessful = isStatsGenerationSuccessful( state, secondarySiteId );

			expect( isSuccessful ).to.be.false;
		} );

		it( 'should return true if the stats generation request status is success', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							generateStatus: {
								[ primarySiteId ]: { generating: false, status: 'success' }
							}
						}
					}
				}
			};
			const isSuccessful = isStatsGenerationSuccessful( state, primarySiteId );

			expect( isSuccessful ).to.be.true;
		} );

		it( 'should return false if the stats generation request status is error', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							generateStatus: {
								[ primarySiteId ]: { generating: false, status: 'error' }
							}
						}
					}
				}
			};
			const isSuccessful = isStatsGenerationSuccessful( state, primarySiteId );

			expect( isSuccessful ).to.be.false;
		} );
	} );

	describe( 'getStatsGenerationStatus()', () => {
		it( 'should return undefined if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							generateStatus: {
								[ primarySiteId ]: { generating: true, status: 'pending' }
							}
						}
					}
				}
			};
			const status = getStatsGenerationStatus( state, secondarySiteId );

			expect( status ).to.be.undefined;
		} );

		it( 'should return success if the stats generation request status is success', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							generateStatus: {
								[ primarySiteId ]: { generating: false, status: 'success' }
							}
						}
					}
				}
			};
			const status = getStatsGenerationStatus( state, primarySiteId );

			expect( status ).to.eql( 'success' );
		} );

		it( 'should return error if the stats generation request status is error', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							generateStatus: {
								[ primarySiteId ]: { generating: false, status: 'error' }
							}
						}
					}
				}
			};
			const status = getStatsGenerationStatus( state, primarySiteId );

			expect( status ).to.eql( 'error' );
		} );

		it( 'should return pending if the stats generation request status is pending', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							generateStatus: {
								[ primarySiteId ]: { generating: true, status: 'pending' }
							}
						}
					}
				}
			};
			const status = getStatsGenerationStatus( state, primarySiteId );

			expect( status ).to.eql( 'pending' );
		} );
	} );

	describe( 'getStats()', () => {
		const primaryStats = { generated: 1493997829 };

		it( 'should return null if no state exists', () => {
			const state = {
				extensions: {
					wpSuperCache: undefined,
				}
			};
			const stats = getStats( state, primarySiteId );

			expect( stats ).to.be.null;
		} );

		it( 'should return null if the site is not attached', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							items: {
								[ primarySiteId ]: primaryStats,
							}
						}
					}
				}
			};
			const stats = getStats( state, secondarySiteId );

			expect( stats ).to.be.null;
		} );

		it( 'should return the stats for a siteId', () => {
			const state = {
				extensions: {
					wpSuperCache: {
						stats: {
							items: {
								[ primarySiteId ]: primaryStats,
							}
						}
					}
				}
			};
			const stats = getStats( state, primarySiteId );

			expect( stats ).to.eql( primaryStats );
		} );
	} );
} );
