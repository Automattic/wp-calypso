/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getIsDismissed, getIsValid } from '../selectors';
import { TIME_BETWEEN_PROMPTS } from '../constants';

const TEST_SITE_ID = 123456789;
const reduxState = {
	ui: {
		selectedSiteId: TEST_SITE_ID,
	},
};

describe( 'selectors', () => {
	describe( 'Scan Review Prompt:', () => {
		describe( 'getIsDismissed()', () => {
			test( 'should return false if no preference saved', () => {
				const state = {
					...reduxState,
					preferences: {},
				};
				expect( getIsDismissed( state, 'scan' ) ).to.be.false;
			} );
			test( 'should return false if no preference saved for the currently selectedSiteId', () => {
				const state = {
					...reduxState,
					preferences: {
						localValues: {
							'jetpack-review-prompt': {
								scan: {
									// not the currently selectedSiteId
									[ 3458899 ]: {
										dismissCount: 1,
										dismissedAt: Date.now() - TIME_BETWEEN_PROMPTS * 2,
										reviewed: true,
										validFrom: null,
									},
								},
							},
						},
					},
				};
				expect( getIsDismissed( state, 'scan' ) ).to.be.false;
			} );
			test( 'should return true if reviewed', () => {
				const state = {
					...reduxState,
					preferences: {
						localValues: {
							'jetpack-review-prompt': {
								scan: {
									[ TEST_SITE_ID ]: {
										dismissCount: 1,
										dismissedAt: Date.now() - TIME_BETWEEN_PROMPTS * 2,
										reviewed: true,
										validFrom: null,
									},
								},
							},
						},
					},
				};
				expect( getIsDismissed( state, 'scan' ) ).to.be.true;
			} );
			test( 'should return false if dismissed just now', () => {
				const state = {
					...reduxState,
					preferences: {
						localValues: {
							'jetpack-review-prompt': {
								scan: {
									[ TEST_SITE_ID ]: {
										dismissCount: 1,
										dismissedAt: Date.now() /* - TIME_BETWEEN_PROMPTS * 2*/,
										reviewed: true,
										validFrom: null,
									},
								},
							},
						},
					},
				};
				expect( getIsDismissed( state, 'scan' ) ).to.be.true;
			} );
			test( 'should return true if dismissed longer than TIME_BETWEEN_PROMPTS', () => {
				const state = {
					...reduxState,
					preferences: {
						localValues: {
							'jetpack-review-prompt': {
								scan: {
									[ TEST_SITE_ID ]: {
										dismissCount: 1,
										dismissedAt: Date.now() - TIME_BETWEEN_PROMPTS * 2,
										reviewed: true,
										validFrom: null,
									},
								},
							},
						},
					},
				};
				expect( getIsDismissed( state, 'scan' ) ).to.be.true;
			} );
			test( 'should return true if dismissed twice', () => {
				const state = {
					...reduxState,
					preferences: {
						localValues: {
							'jetpack-review-prompt': {
								scan: {
									[ TEST_SITE_ID ]: {
										dismissCount: 2,
										dismissedAt: Date.now() - TIME_BETWEEN_PROMPTS * 2,
										reviewed: true,
										validFrom: null,
									},
								},
							},
						},
					},
				};
				expect( getIsDismissed( state, 'scan' ) ).to.be.true;
			} );
		} );

		describe( 'getIsValid()', () => {
			test( 'should return false if preference is empty', () => {
				const state = {
					...reduxState,
					preferences: {},
				};
				expect( getIsValid( state, 'scan' ) ).to.be.false;
			} );
			test( 'should return false if isValid has not been set', () => {
				const state = {
					...reduxState,
					preferences: {
						localValues: {
							'jetpack-review-prompt': {
								scan: {
									[ TEST_SITE_ID ]: {
										dismissCount: 1,
										dismissedAt: Date.now() - TIME_BETWEEN_PROMPTS * 2,
										reviewed: true,
										validFrom: null,
									},
								},
							},
						},
					},
				};
				expect( getIsValid( state, 'scan' ) ).to.be.false;
			} );
			test( 'should return true if isValid has been set', () => {
				const state = {
					...reduxState,
					preferences: {
						localValues: {
							'jetpack-review-prompt': {
								scan: {
									[ TEST_SITE_ID ]: {
										dismissCount: 1,
										dismissedAt: Date.now() - TIME_BETWEEN_PROMPTS * 2,
										reviewed: true,
										validFrom: Date.now() - 1,
									},
								},
							},
						},
					},
				};
				expect( getIsValid( state, 'scan' ) ).to.be.true;
			} );
			test( 'should return false if isValid is not set on the currently selectedSiteId', () => {
				const state = {
					ui: {
						selectedSiteId: TEST_SITE_ID,
					},
					preferences: {
						localValues: {
							'jetpack-review-prompt': {
								scan: {
									// not the currently selected site ID.
									[ 56723451 ]: {
										dismissCount: 1,
										dismissedAt: Date.now() - TIME_BETWEEN_PROMPTS * 2,
										reviewed: true,
										validFrom: null,
									},
								},
								restore: {
									dismissCount: 0,
									dismissedAt: null,
									reviewed: false,
									validFrom: Date.now() - 1,
								},
							},
						},
					},
				};
				expect( getIsValid( state, 'scan' ) ).to.be.false;
			} );
		} );
	} );
	describe( 'Restore Review Prompt:', () => {
		describe( 'getIsDismissed()', () => {
			test( 'should return false if no preference saved', () => {
				const state = {
					...reduxState,
					preferences: {},
				};
				expect( getIsDismissed( state, 'restore' ) ).to.be.false;
			} );
			test( 'should return true if reviewed', () => {
				const state = {
					...reduxState,
					preferences: {
						localValues: {
							'jetpack-review-prompt': {
								restore: {
									dismissCount: 1,
									dismissedAt: Date.now() - TIME_BETWEEN_PROMPTS * 2,
									reviewed: true,
									validFrom: null,
								},
							},
						},
					},
				};
				expect( getIsDismissed( state, 'restore' ) ).to.be.true;
			} );
			test( 'should return false if dismissed just now', () => {
				const state = {
					...reduxState,
					preferences: {
						localValues: {
							'jetpack-review-prompt': {
								restore: {
									dismissCount: 1,
									dismissedAt: Date.now() - TIME_BETWEEN_PROMPTS * 2,
									reviewed: true,
									validFrom: null,
								},
							},
						},
					},
				};
				expect( getIsDismissed( state, 'restore' ) ).to.be.true;
			} );
			test( 'should return true if dismissed longer than TIME_BETWEEN_PROMPTS', () => {
				const state = {
					...reduxState,
					preferences: {
						localValues: {
							'jetpack-review-prompt': {
								restore: {
									dismissCount: 1,
									dismissedAt: Date.now() - TIME_BETWEEN_PROMPTS * 2,
									reviewed: true,
									validFrom: null,
								},
							},
						},
					},
				};
				expect( getIsDismissed( state, 'restore' ) ).to.be.true;
			} );
			test( 'should return true if dismissed twice', () => {
				const state = {
					...reduxState,
					preferences: {
						localValues: {
							'jetpack-review-prompt': {
								restore: {
									dismissCount: 2,
									dismissedAt: Date.now() - TIME_BETWEEN_PROMPTS * 2,
									reviewed: true,
									validFrom: null,
								},
							},
						},
					},
				};
				expect( getIsDismissed( state, 'restore' ) ).to.be.true;
			} );
		} );

		describe( 'getIsValid()', () => {
			test( 'should return false if preference is empty', () => {
				const state = {
					...reduxState,
					preferences: {},
				};
				expect( getIsValid( state, 'restore' ) ).to.be.false;
			} );
			test( 'should return false if isValid has not been set', () => {
				const state = {
					...reduxState,
					preferences: {
						localValues: {
							'jetpack-review-prompt': {
								restore: {
									dismissCount: 1,
									dismissedAt: Date.now() - TIME_BETWEEN_PROMPTS * 2,
									reviewed: true,
									validFrom: null,
								},
							},
						},
					},
				};
				expect( getIsValid( state, 'restore' ) ).to.be.false;
			} );
			test( 'should return true if isValid has been set', () => {
				const state = {
					...reduxState,
					preferences: {
						localValues: {
							'jetpack-review-prompt': {
								restore: {
									dismissCount: 1,
									dismissedAt: Date.now() - TIME_BETWEEN_PROMPTS * 2,
									reviewed: true,
									validFrom: Date.now() - 1,
								},
							},
						},
					},
				};
				expect( getIsValid( state, 'restore' ) ).to.be.true;
			} );
			test( 'should return true if isValid has been set on correct sub-property', () => {
				const state = {
					...reduxState,
					preferences: {
						localValues: {
							'jetpack-review-prompt': {
								scan: {
									[ TEST_SITE_ID ]: {
										dismissCount: 1,
										dismissedAt: Date.now() - TIME_BETWEEN_PROMPTS * 2,
										reviewed: true,
										validFrom: Date.now() - 1,
									},
								},
								restore: {
									dismissCount: 0,
									dismissedAt: null,
									reviewed: false,
									validFrom: null,
								},
							},
						},
					},
				};
				expect( getIsValid( state, 'restore' ) ).to.be.false;
				expect( getIsValid( state, 'scan' ) ).to.be.true;
			} );
		} );
	} );
} );
