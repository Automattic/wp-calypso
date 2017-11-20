/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getSetupState,
	isCreatingPages,
	isFetchingSetupStatus,
	shouldGoToNextStep,
	shouldShowSetupWizard,
} from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'getSettingsState()', () => {
		test( 'should return an empty object if no state exists', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: undefined,
					},
				},
			};
			const settingsState = getSetupState( state );

			expect( settingsState ).to.deep.equal( {} );
		} );

		test( 'should return the setup state', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							[ primarySiteId ]: {
								creating: false,
								nextStep: true,
							},
						},
					},
				},
			};
			const settings = getSetupState( state );

			expect( settings ).to.deep.equal( {
				[ primarySiteId ]: { creating: false, nextStep: true },
			} );
		} );
	} );

	describe( 'isCreatingPages()', () => {
		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							[ primarySiteId ]: {
								creating: true,
							},
						},
					},
				},
			};
			const isCreating = isCreatingPages( state, secondarySiteId );

			expect( isCreating ).to.be.false;
		} );

		test( 'should return false if the pages are not being created', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							[ primarySiteId ]: {
								creating: false,
							},
						},
					},
				},
			};
			const isCreating = isCreatingPages( state, primarySiteId );

			expect( isCreating ).to.be.false;
		} );

		test( 'should return true if the pages are being created', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							[ primarySiteId ]: {
								creating: true,
							},
						},
					},
				},
			};
			const isCreating = isCreatingPages( state, primarySiteId );

			expect( isCreating ).to.be.true;
		} );
	} );

	describe( 'isFetchingSetupStatus()', () => {
		test( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: undefined,
					},
				},
			};
			const isFetching = isFetchingSetupStatus( state, primarySiteId );

			expect( isFetching ).to.be.false;
		} );

		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							[ primarySiteId ]: {
								fetching: true,
							},
						},
					},
				},
			};
			const isFetching = isFetchingSetupStatus( state, secondarySiteId );

			expect( isFetching ).to.be.false;
		} );

		test( 'should return false if the setup status is not being fetched', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							[ primarySiteId ]: {
								fetching: false,
							},
						},
					},
				},
			};
			const isFetching = isFetchingSetupStatus( state, primarySiteId );

			expect( isFetching ).to.be.false;
		} );

		test( 'should return true if the setup status is being fetched', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							[ primarySiteId ]: {
								fetching: true,
							},
						},
					},
				},
			};
			const isFetching = isFetchingSetupStatus( state, primarySiteId );

			expect( isFetching ).to.be.true;
		} );
	} );

	describe( 'shouldGoToNextStep()', () => {
		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							[ primarySiteId ]: {
								nextStep: true,
							},
						},
					},
				},
			};
			const goToNextStep = shouldGoToNextStep( state, secondarySiteId );

			expect( goToNextStep ).to.be.false;
		} );

		test( 'should return false if the pages are not being created', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							[ primarySiteId ]: {
								nextStep: false,
							},
						},
					},
				},
			};
			const goToNextStep = shouldGoToNextStep( state, primarySiteId );

			expect( goToNextStep ).to.be.false;
		} );

		test( 'should return true if the pages are being created', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							[ primarySiteId ]: {
								nextStep: true,
							},
						},
					},
				},
			};
			const goToNextStep = shouldGoToNextStep( state, primarySiteId );

			expect( goToNextStep ).to.be.true;
		} );
	} );

	describe( 'shouldShowSetupWizard()', () => {
		test( 'should return false if no state exists', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: undefined,
					},
				},
			};
			const showWizard = shouldShowSetupWizard( state, primarySiteId );

			expect( showWizard ).to.be.false;
		} );

		test( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							[ primarySiteId ]: {
								status: true,
							},
						},
					},
				},
			};
			const showWizard = shouldShowSetupWizard( state, secondarySiteId );

			expect( showWizard ).to.be.false;
		} );

		test( 'should return false if the wizard should not be shown', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							[ primarySiteId ]: {
								status: false,
							},
						},
					},
				},
			};
			const showWizard = shouldShowSetupWizard( state, primarySiteId );

			expect( showWizard ).to.be.false;
		} );

		test( 'should return true if the wizard should be shown', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							[ primarySiteId ]: {
								status: true,
							},
						},
					},
				},
			};
			const showWizard = shouldShowSetupWizard( state, primarySiteId );

			expect( showWizard ).to.be.true;
		} );
	} );
} );
