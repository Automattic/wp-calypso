/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isCreatingPages, isFetchingSetupStatus, shouldGoToNextStep, shouldShowSetupWizard } from '../selectors';

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

	describe( 'isFetchingSetupStatus()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: undefined,
					}
				}
			};
			const isFetching = isFetchingSetupStatus( state, primarySiteId );

			expect( isFetching ).to.be.false;
		} );

		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							fetching: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const isFetching = isFetchingSetupStatus( state, secondarySiteId );

			expect( isFetching ).to.be.false;
		} );

		it( 'should return false if the setup status is not being fetched', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							fetching: {
								[ primarySiteId ]: false,
							}
						}
					}
				}
			};
			const isFetching = isFetchingSetupStatus( state, primarySiteId );

			expect( isFetching ).to.be.false;
		} );

		it( 'should return true if the setup status is being fetched', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							fetching: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const isFetching = isFetchingSetupStatus( state, primarySiteId );

			expect( isFetching ).to.be.true;
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

	describe( 'shouldShowSetupWizard()', () => {
		it( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: undefined,
					}
				}
			};
			const showWizard = shouldShowSetupWizard( state, primarySiteId );

			expect( showWizard ).to.be.false;
		} );

		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							status: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const showWizard = shouldShowSetupWizard( state, secondarySiteId );

			expect( showWizard ).to.be.false;
		} );

		it( 'should return false if the wizard should not be shown', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							status: {
								[ primarySiteId ]: false,
							}
						}
					}
				}
			};
			const showWizard = shouldShowSetupWizard( state, primarySiteId );

			expect( showWizard ).to.be.false;
		} );

		it( 'should return true if the wizard should be shown', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							status: {
								[ primarySiteId ]: true,
							}
						}
					}
				}
			};
			const showWizard = shouldShowSetupWizard( state, primarySiteId );

			expect( showWizard ).to.be.true;
		} );
	} );
} );
