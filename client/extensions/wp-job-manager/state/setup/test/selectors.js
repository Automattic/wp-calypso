/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isCreatingPages, shouldGoToNextStep } from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'isCreatingPages()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: undefined,
					}
				}
			};
			const isCreating = isCreatingPages( state, primarySiteId );

			expect( isCreating ).to.be.false;
		} );

		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							creating: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const isCreating = isCreatingPages( state, secondarySiteId );

			expect( isCreating ).to.be.false;
		} );

		it( 'should return false if the pages are not being created', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							creating: {
								[ primarySiteId ]: false,
							}
						}
					}
				}
			};
			const isCreating = isCreatingPages( state, primarySiteId );

			expect( isCreating ).to.be.false;
		} );

		it( 'should return true if the pages are being created', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							creating: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const isCreating = isCreatingPages( state, primarySiteId );

			expect( isCreating ).to.be.true;
		} );
	} );

	describe( 'shouldGoToNextStep()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: undefined,
					}
				}
			};
			const goToNextStep = shouldGoToNextStep( state, primarySiteId );

			expect( goToNextStep ).to.be.false;
		} );

		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							nextStep: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const goToNextStep = shouldGoToNextStep( state, secondarySiteId );

			expect( goToNextStep ).to.be.false;
		} );

		it( 'should return false if the pages are not being created', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							nextStep: {
								[ primarySiteId ]: false,
							}
						}
					}
				}
			};
			const goToNextStep = shouldGoToNextStep( state, primarySiteId );

			expect( goToNextStep ).to.be.false;
		} );

		it( 'should return true if the pages are being created', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							nextStep: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const goToNextStep = shouldGoToNextStep( state, primarySiteId );

			expect( goToNextStep ).to.be.true;
		} );
	} );
} );
