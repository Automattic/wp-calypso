/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_DEACTIVATE_SUCCESS,
	JETPACK_MODULES_RECEIVE,
	JETPACK_SETTINGS_RECEIVE,
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL,
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_SUCCESS,
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_FAILURE,
	JETPACK_SETTINGS_REQUEST,
	JETPACK_SETTINGS_REQUEST_FAILURE,
	JETPACK_SETTINGS_REQUEST_SUCCESS,
	JETPACK_SETTINGS_UPDATE,
	JETPACK_SETTINGS_UPDATE_SUCCESS,
	JETPACK_SETTINGS_UPDATE_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import {
	items as itemsReducer,
	requests as requestsReducer,
	saveRequests as saveRequestsReducer,
} from '../reducer';

import {
	settings as SETTINGS_FIXTURE,
	requests as REQUESTS_FIXTURE
} from './fixture';

describe( 'reducer', () => {
	describe( 'items', () => {
		it( 'state should default to empty object', () => {
			const state = itemsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should store new settings in the items object', () => {
			const stateIn = {},
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_RECEIVE,
					siteId,
					settings: SETTINGS_FIXTURE[ siteId ]
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: SETTINGS_FIXTURE[ siteId ]
			} );
		} );

		it( 'should store new settings to the items object for the right site', () => {
			const siteId = 87654321,
				stateIn = {
					12345678: SETTINGS_FIXTURE[ 12345678 ]
				},
				action = {
					type: JETPACK_SETTINGS_RECEIVE,
					siteId,
					settings: SETTINGS_FIXTURE[ siteId ]
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( SETTINGS_FIXTURE );
		} );

		it( 'should accumulate new settings to the items object for the right site', () => {
			const siteId = 12345678,
				stateIn = SETTINGS_FIXTURE,
				action = {
					type: JETPACK_SETTINGS_RECEIVE,
					siteId,
					settings: SETTINGS_FIXTURE[ 87654321 ]
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: Object.assign( {}, SETTINGS_FIXTURE[ 12345678 ], SETTINGS_FIXTURE[ 87654321 ] ),
				87654321: SETTINGS_FIXTURE[ 87654321 ],
			} );
		} );

		it( 'should replace settings in the items object when settings are already loaded for a site', () => {
			const siteId = 12345678,
				stateIn = {
					12345678: SETTINGS_FIXTURE[ siteId ]
				},
				action = {
					type: JETPACK_SETTINGS_RECEIVE,
					siteId,
					settings: { ...SETTINGS_FIXTURE[ siteId ], test_setting: 123 }
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: { ...SETTINGS_FIXTURE[ siteId ], test_setting: 123 }
			} );
		} );

		it( 'should update settings in the items object', () => {
			const siteId = 12345678,
				stateIn = {
					12345678: SETTINGS_FIXTURE[ siteId ]
				},
				action = {
					type: JETPACK_SETTINGS_UPDATE_SUCCESS,
					siteId,
					settings: { test_setting: 123 }
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: { ...SETTINGS_FIXTURE[ siteId ], test_setting: 123 }
			} );
		} );

		it( 'should mark the module as active upon successful module activation', () => {
			const siteId = 12345678,
				stateIn = {
					12345678: {
						setting_123: 'test',
						'module-a': false
					}
				},
				action = {
					type: JETPACK_MODULE_ACTIVATE_SUCCESS,
					siteId,
					moduleSlug: 'module-a'
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: {
					setting_123: 'test',
					'module-a': true
				}
			} );
		} );

		it( 'should mark the module as inactive upon successful module deactivation', () => {
			const siteId = 12345678,
				stateIn = {
					12345678: {
						setting_123: 'test',
						'module-a': true
					}
				},
				action = {
					type: JETPACK_MODULE_DEACTIVATE_SUCCESS,
					siteId,
					moduleSlug: 'module-a'
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: {
					setting_123: 'test',
					'module-a': false
				}
			} );
		} );

		it( 'should update the module activation state upon receiving new modules', () => {
			const siteId = 12345678,
				stateIn = {
					12345678: {
						setting_123: 'test',
						'module-a': true,
						'module-b': false
					}
				},
				action = {
					type: JETPACK_MODULES_RECEIVE,
					siteId,
					modules: {
						'module-a': {
							active: false
						},
						'module-b': {
							active: true
						}
					}
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: {
					setting_123: 'test',
					'module-a': false,
					'module-b': true,
				}
			} );
		} );

		it( 'should update module settings with normalized ones when receiving new modules', () => {
			const siteId = 12345678,
				stateIn = {
					12345678: {
						setting_123: 'test',
					}
				},
				action = {
					type: JETPACK_MODULES_RECEIVE,
					siteId,
					modules: {
						minileven: {
							active: true,
							options: {
								wp_mobile_excerpt: {
									current_value: true,
								},
								some_other_option: {
									current_value: '123',
								},
							}
						}
					}
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: {
					setting_123: 'test',
					minileven: true,
					wp_mobile_excerpt: true,
					some_other_option: '123'
				}
			} );
		} );

		it( 'should update the post_by_email_address setting after a successful post by email update', () => {
			const siteId = 12345678,
				stateIn = {
					12345678: {
						setting_123: 'test',
						post_by_email_address: 'example1234@automattic.com',
					}
				},
				action = {
					type: JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_SUCCESS,
					siteId,
					email: 'example5678@automattic.com'
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {
				12345678: {
					setting_123: 'test',
					post_by_email_address: 'example5678@automattic.com',
				}
			} );
		} );

		it( 'should not persist state', () => {
			const stateIn = SETTINGS_FIXTURE,
				action = {
					type: SERIALIZE
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const stateIn = SETTINGS_FIXTURE,
				action = {
					type: DESERIALIZE
				};
			const stateOut = itemsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
		} );
	} );

	describe( 'requests', () => {
		it( 'state should default to an empty object', () => {
			const state = requestsReducer( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should set [ siteId ].requesting to true when requesting settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_REQUEST,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ].requesting ).to.be.true;
		} );

		it( 'should set [ siteId ].requesting to false when successfully requested settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_REQUEST_SUCCESS,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ].requesting ).to.be.false;
		} );

		it( 'should set [ siteId ].requesting to false when unable to complete request for settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_REQUEST_FAILURE,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ].requesting ).to.be.false;
		} );

		it( 'should set [ siteId ].updating to true when updating settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_UPDATE,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ].updating ).to.be.true;
		} );

		it( 'should set [ siteId ].updating to false when successfully requested settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_UPDATE_SUCCESS,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ].updating ).to.be.false;
		} );

		it( 'should set [ siteId ].updating to false when unable to complete request for settings', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_UPDATE_FAILURE,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ].updating ).to.be.false;
		} );

		it( 'should set [ siteId ].regeneratingPostByEmail to true when initiating post by email regeneration', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ].regeneratingPostByEmail ).to.be.true;
		} );

		it( 'should set [ siteId ].regeneratingPostByEmail to false when successfully regenerated post by email', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_SUCCESS,
					email: 'example1234@automattic.com',
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ].regeneratingPostByEmail ).to.be.false;
		} );

		it( 'should set [ siteId ].regeneratingPostByEmail to false when unable to complete regenerate post by email', () => {
			const stateIn = REQUESTS_FIXTURE,
				siteId = 12345678,
				action = {
					type: JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_FAILURE,
					siteId,
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut[ siteId ].regeneratingPostByEmail ).to.be.false;
		} );

		it( 'should not persist state', () => {
			const stateIn = REQUESTS_FIXTURE,
				action = {
					type: SERIALIZE
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const stateIn = REQUESTS_FIXTURE,
				action = {
					type: DESERIALIZE
				};
			const stateOut = requestsReducer( deepFreeze( stateIn ), action );
			expect( stateOut ).to.eql( {} );
		} );
	} );

	describe( 'saveRequests()', () => {
		it( 'should default to an empty object', () => {
			const state = saveRequestsReducer( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should set request status to pending if request in progress', () => {
			const state = saveRequestsReducer( undefined, {
				type: JETPACK_SETTINGS_UPDATE,
				siteId: 12345678
			} );

			expect( state ).to.eql( {
				12345678: { saving: true, status: 'pending', error: false }
			} );
		} );

		it( 'should accumulate save requests statuses', () => {
			const previousState = deepFreeze( {
				12345678: { saving: true, status: 'pending', error: false }
			} );
			const state = saveRequestsReducer( previousState, {
				type: JETPACK_SETTINGS_UPDATE,
				siteId: 87654321
			} );

			expect( state ).to.eql( {
				12345678: { saving: true, status: 'pending', error: false },
				87654321: { saving: true, status: 'pending', error: false }
			} );
		} );

		it( 'should set save request to success if request finishes successfully', () => {
			const previousState = deepFreeze( {
				12345678: { saving: true, status: 'pending', error: false }
			} );
			const state = saveRequestsReducer( previousState, {
				type: JETPACK_SETTINGS_UPDATE_SUCCESS,
				siteId: 12345678
			} );

			expect( state ).to.eql( {
				12345678: { saving: false, status: 'success', error: false }
			} );
		} );

		it( 'should set save request to error if request finishes with failure', () => {
			const previousState = deepFreeze( {
				12345678: { saving: true, status: 'pending', error: false }
			} );
			const state = saveRequestsReducer( previousState, {
				type: JETPACK_SETTINGS_UPDATE_FAILURE,
				siteId: 12345678,
				error: 'my error'
			} );

			expect( state ).to.eql( {
				12345678: { saving: false, status: 'error', error: 'my error' }
			} );
		} );

		it( 'should not persist state', () => {
			const previousState = deepFreeze( {
				12345678: { saving: true, status: 'pending', error: false }
			} );
			const state = saveRequestsReducer( previousState, {
				type: SERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const previousState = deepFreeze( {
				12345678: { saving: true, status: 'pending', error: false }
			} );
			const state = saveRequestsReducer( previousState, {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
	} );
} );
