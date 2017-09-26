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
	shouldGoToNextStep,
} from '../selectors';

describe( 'selectors', () => {
	const primarySiteId = 123456;
	const secondarySiteId = 456789;

	describe( 'getSettingsState()', () => {
		it( 'should return an empty object if no state exists', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: undefined,
					}
				}
			};
			const settingsState = getSetupState( state );

			expect( settingsState ).to.deep.equal( {} );
		} );

		it( 'should return the setup state', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							[ primarySiteId ]: {
								creating: false,
								nextStep: true
							}
						}
					}
				}
			};
			const settings = getSetupState( state );

			expect( settings ).to.deep.equal( { [ primarySiteId ]: { creating: false, nextStep: true } } );
		} );
	} );

	describe( 'isCreatingPages()', () => {
		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							[ primarySiteId ]: {
								creating: true,
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
							[ primarySiteId ]: {
								creating: false,
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
							[ primarySiteId ]: {
								creating: true,
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
		it( 'should return false if the site is not attached', () => {
			const state = {
				extensions: {
					wpJobManager: {
						setup: {
							[ primarySiteId ]: {
								nextStep: true,
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
							[ primarySiteId ]: {
								nextStep: false,
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
							[ primarySiteId ]: {
								nextStep: true,
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
