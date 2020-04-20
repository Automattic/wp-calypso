/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import vouchersReducer, {
	items as itemsReducer,
	requesting as requestReducer,
	errors as errorsReducer,
} from '../reducer';
import {
	SITE_ID_0 as firstSiteId,
	SITE_ID_1 as secondSiteId,
	VOUCHER_0 as firstVoucher,
	VOUCHER_1 as secondVoucher,
	CREDITS as oneOfOurServiceTypesArray,
	AD_CREDITS_0 as firstAdCredits,
	AD_CREDITS_1 as secondAdCredits,
	ERROR_OBJECT as errorObject,
	SERVICE_TYPE as oneOfOurServiceTypes,
} from './fixture';
import {
	SITE_VOUCHERS_ASSIGN_RECEIVE,
	SITE_VOUCHERS_ASSIGN_REQUEST,
	SITE_VOUCHERS_ASSIGN_REQUEST_SUCCESS,
	SITE_VOUCHERS_ASSIGN_REQUEST_FAILURE,
	SITE_VOUCHERS_RECEIVE,
	SITE_VOUCHERS_REQUEST,
	SITE_VOUCHERS_REQUEST_SUCCESS,
	SITE_VOUCHERS_REQUEST_FAILURE,
} from 'state/action-types';

import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	let sandbox;

	useSandbox( ( newSandbox ) => {
		sandbox = newSandbox;
		sandbox.stub( console, 'warn' );
	} );

	test( 'should export expected reducer keys', () => {
		expect( vouchersReducer( undefined, {} ) ).to.have.keys( [ 'items', 'requesting', 'errors' ] );
	} );

	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			expect( itemsReducer( undefined, {} ) ).to.eql( {} );
		} );

		test( 'should index items state by siteId', () => {
			const initialState = undefined;
			const action = {
				type: SITE_VOUCHERS_RECEIVE,
				siteId: firstSiteId,
				vouchers: oneOfOurServiceTypesArray,
			};
			const newState = itemsReducer( initialState, action );

			const expectedState = {
				[ firstSiteId ]: oneOfOurServiceTypesArray,
			};

			deepFreeze( action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should override vouchers for same site', () => {
			const initialState = {
				[ firstSiteId ]: oneOfOurServiceTypesArray,
			};
			const action = {
				type: SITE_VOUCHERS_RECEIVE,
				siteId: firstSiteId,
				vouchers: firstAdCredits,
			};
			const expectedState = {
				[ firstSiteId ]: firstAdCredits,
			};
			deepFreeze( initialState );
			deepFreeze( action );

			expect( itemsReducer( initialState, action ) ).to.eql( expectedState );
		} );

		test( 'should accumulate vouchers for different sites', () => {
			const initialState = {
				[ firstSiteId ]: firstAdCredits,
			};
			const action = {
				type: SITE_VOUCHERS_RECEIVE,
				siteId: secondSiteId,
				vouchers: secondAdCredits,
			};
			const newState = itemsReducer( initialState, action );

			const expectedState = {
				[ firstSiteId ]: firstAdCredits,
				[ secondSiteId ]: secondAdCredits,
			};

			deepFreeze( initialState );
			deepFreeze( action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should add SERVICE_TYPE voucher - initial state: undefined', () => {
			const initialState = undefined;
			const action = {
				type: SITE_VOUCHERS_ASSIGN_RECEIVE,
				siteId: firstSiteId,
				serviceType: oneOfOurServiceTypes,
				voucher: firstVoucher,
			};
			const newState = itemsReducer( initialState, action );
			const expectedState = {
				[ firstSiteId ]: {
					[ oneOfOurServiceTypes ]: [ firstVoucher ],
				},
			};

			deepFreeze( action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should accumulate SERVICE_TYPE voucher', () => {
			const initialState = {
				[ firstSiteId ]: {
					[ oneOfOurServiceTypes ]: [ firstVoucher ],
				},
			};
			const action = {
				type: SITE_VOUCHERS_ASSIGN_RECEIVE,
				siteId: firstSiteId,
				serviceType: oneOfOurServiceTypes,
				voucher: secondVoucher,
			};
			const newState = itemsReducer( initialState, action );

			const expectedState = {
				[ firstSiteId ]: {
					[ oneOfOurServiceTypes ]: [ firstVoucher, secondVoucher ],
				},
			};

			deepFreeze( initialState );
			deepFreeze( action );

			expect( newState ).to.eql( expectedState );
		} );

		test( 'should persist state', () => {
			const state = deepFreeze( {
				[ firstSiteId ]: firstAdCredits,
				[ secondSiteId ]: secondAdCredits,
			} );
			expect( itemsReducer( state, { type: 'SERIALIZE' } ) ).to.eql( state );
		} );

		test( 'should load persisted state', () => {
			const state = deepFreeze( {
				[ firstSiteId ]: firstAdCredits,
				[ secondSiteId ]: secondAdCredits,
			} );
			expect( itemsReducer( state, { type: 'DESERIALIZE' } ) ).to.eql( state );
		} );

		test( 'should not load invalid persisted state', () => {
			const state = deepFreeze( {
				[ firstSiteId ]: [ { voucher: 1234567890 } ],
			} );
			expect( itemsReducer( state, { type: 'DESERIALIZE' } ) ).to.eql( {} );
		} );
	} );

	describe( '#requesting()', () => {
		test( 'should default to an empty object', () => {
			expect( requestReducer( undefined, {} ) ).to.eql( {} );
		} );

		describe( 'getAll', () => {
			test( 'should set state by siteId', () => {
				const initialState = undefined;
				const action = {
					type: SITE_VOUCHERS_REQUEST,
					siteId: firstSiteId,
				};
				const newState = requestReducer( initialState, action );
				const expectedState = {
					[ firstSiteId ]: {
						getAll: true,
						assign: false,
					},
				};

				deepFreeze( action );

				expect( newState ).to.eql( expectedState );
			} );

			test( 'should accumulate state by siteId', () => {
				const initialState = {
					[ firstSiteId ]: {
						getAll: false,
						assign: false,
					},
				};
				const action = {
					type: SITE_VOUCHERS_REQUEST,
					siteId: secondSiteId,
				};
				const newState = requestReducer( initialState, action );
				const expectedState = {
					[ firstSiteId ]: {
						getAll: false,
						assign: false,
					},
					[ secondSiteId ]: {
						getAll: true,
						assign: false,
					},
				};

				deepFreeze( action );
				deepFreeze( initialState );

				expect( newState ).to.eql( expectedState );
			} );

			test( 'should update state by siteId on SUCCESS', () => {
				const initialState = {
					[ firstSiteId ]: {
						getAll: true,
						assign: false,
					},
				};
				const action = {
					type: SITE_VOUCHERS_REQUEST_SUCCESS,
					siteId: firstSiteId,
				};
				const newState = requestReducer( initialState, action );
				const expectedState = {
					[ firstSiteId ]: {
						getAll: false,
						assign: false,
					},
				};

				deepFreeze( initialState );
				deepFreeze( action );

				expect( newState ).to.eql( expectedState );
			} );

			test( 'should update state by siteId on FAILURE', () => {
				const initialState = {
					[ firstSiteId ]: {
						getAll: true,
						assign: false,
					},
				};
				const action = {
					type: SITE_VOUCHERS_REQUEST_FAILURE,
					siteId: firstSiteId,
				};
				const newState = requestReducer( initialState, action );
				const expectedState = {
					[ firstSiteId ]: {
						getAll: false,
						assign: false,
					},
				};

				deepFreeze( initialState );
				deepFreeze( action );

				expect( newState ).to.eql( expectedState );
			} );

			test( 'should accumulate state by siteId on FAILURE', () => {
				const initialState = {
					[ firstSiteId ]: {
						getAll: false,
						assign: false,
					},
				};
				const action = {
					type: SITE_VOUCHERS_REQUEST_FAILURE,
					siteId: secondSiteId,
				};
				const newState = requestReducer( initialState, action );
				const expectedState = {
					[ firstSiteId ]: {
						getAll: false,
						assign: false,
					},
					[ secondSiteId ]: {
						getAll: false,
						assign: false,
					},
				};

				deepFreeze( initialState );
				deepFreeze( action );

				expect( newState ).to.eql( expectedState );
			} );
		} );

		describe( 'assign', () => {
			test( 'should set state by siteId', () => {
				const initialState = undefined;
				const action = {
					type: SITE_VOUCHERS_ASSIGN_REQUEST,
					siteId: firstSiteId,
				};
				const newState = requestReducer( initialState, action );
				const expectedState = {
					[ firstSiteId ]: {
						getAll: false,
						assign: true,
					},
				};

				deepFreeze( action );

				expect( newState ).to.eql( expectedState );
			} );

			test( 'should accumulate state by siteId', () => {
				const initialState = {
					[ firstSiteId ]: {
						getAll: false,
						assign: false,
					},
				};
				const action = {
					type: SITE_VOUCHERS_ASSIGN_REQUEST,
					siteId: secondSiteId,
				};
				const newState = requestReducer( initialState, action );
				const expectedState = {
					[ firstSiteId ]: {
						getAll: false,
						assign: false,
					},
					[ secondSiteId ]: {
						getAll: false,
						assign: true,
					},
				};

				deepFreeze( action );
				deepFreeze( initialState );

				expect( newState ).to.eql( expectedState );
			} );

			test( 'should update state by siteId on SUCCESS', () => {
				const initialState = {
					[ firstSiteId ]: {
						getAll: false,
						assign: true,
					},
				};
				const action = {
					type: SITE_VOUCHERS_ASSIGN_REQUEST_SUCCESS,
					siteId: firstSiteId,
				};
				const newState = requestReducer( initialState, action );
				const expectedState = {
					[ firstSiteId ]: {
						getAll: false,
						assign: false,
					},
				};

				deepFreeze( initialState );
				deepFreeze( action );

				expect( newState ).to.eql( expectedState );
			} );

			test( 'should update state by siteId on FAILURE', () => {
				const initialState = {
					[ firstSiteId ]: {
						getAll: false,
						assign: true,
					},
				};
				const action = {
					type: SITE_VOUCHERS_ASSIGN_REQUEST_FAILURE,
					siteId: firstSiteId,
				};
				const newState = requestReducer( initialState, action );
				const expectedState = {
					[ firstSiteId ]: {
						getAll: false,
						assign: false,
					},
				};

				deepFreeze( initialState );
				deepFreeze( action );

				expect( newState ).to.eql( expectedState );
			} );

			test( 'should accumulate state by siteId on FAILURE', () => {
				const initialState = {
					[ firstSiteId ]: {
						getAll: false,
						assign: false,
					},
				};
				const action = {
					type: SITE_VOUCHERS_ASSIGN_REQUEST_FAILURE,
					siteId: secondSiteId,
				};
				const newState = requestReducer( initialState, action );
				const expectedState = {
					[ firstSiteId ]: {
						getAll: false,
						assign: false,
					},
					[ secondSiteId ]: {
						getAll: false,
						assign: false,
					},
				};

				deepFreeze( initialState );
				deepFreeze( action );

				expect( newState ).to.eql( expectedState );
			} );
		} );
	} );

	describe( '#errors()', () => {
		test( 'should default to an empty object', () => {
			expect( errorsReducer( undefined, {} ) ).to.eql( {} );
		} );

		describe( 'getAll', () => {
			test( 'should clean state by siteId on REQUEST', () => {
				const initialState = {
					[ firstSiteId ]: {
						getAll: errorObject.message,
						assign: null,
					},
				};
				const action = {
					type: SITE_VOUCHERS_REQUEST,
					siteId: firstSiteId,
				};
				const newState = errorsReducer( initialState, action );
				const expectedState = {
					[ firstSiteId ]: {
						getAll: null,
						assign: null,
					},
				};

				deepFreeze( initialState );
				deepFreeze( action );

				expect( newState ).to.eql( expectedState );
			} );

			test( 'should clean state by siteId on SUCCESS', () => {
				const initialState = {
					[ firstSiteId ]: {
						getAll: errorObject.message,
						assign: null,
					},
				};
				const action = {
					type: SITE_VOUCHERS_REQUEST_SUCCESS,
					siteId: firstSiteId,
				};
				const newState = errorsReducer( initialState, action );
				const expectedState = {
					[ firstSiteId ]: {
						getAll: null,
						assign: null,
					},
				};

				deepFreeze( initialState );
				deepFreeze( action );

				expect( newState ).to.eql( expectedState );
			} );

			test( 'should set state by siteId on FAILURE', () => {
				const initialState = undefined;
				const action = {
					type: SITE_VOUCHERS_REQUEST_FAILURE,
					siteId: firstSiteId,
					error: errorObject.message,
				};
				const newState = errorsReducer( initialState, action );
				const expectedState = {
					[ firstSiteId ]: {
						getAll: errorObject.message,
						assign: null,
					},
				};

				deepFreeze( action );

				expect( newState ).to.eql( expectedState );
			} );
		} );

		describe( 'assign', () => {
			test( 'should clean state by siteId on REQUEST', () => {
				const initialState = {
					[ firstSiteId ]: {
						getAll: null,
						assign: errorObject.message,
					},
				};
				const action = {
					type: SITE_VOUCHERS_ASSIGN_REQUEST,
					siteId: firstSiteId,
				};
				const newState = errorsReducer( initialState, action );
				const expectedState = {
					[ firstSiteId ]: {
						getAll: null,
						assign: null,
					},
				};

				deepFreeze( initialState );
				deepFreeze( action );

				expect( newState ).to.eql( expectedState );
			} );

			test( 'should clean state by siteId on SUCCESS', () => {
				const initialState = {
					[ firstSiteId ]: {
						getAll: null,
						assign: errorObject.message,
					},
				};
				const action = {
					type: SITE_VOUCHERS_ASSIGN_REQUEST_SUCCESS,
					siteId: firstSiteId,
				};
				const newState = errorsReducer( initialState, action );
				const expectedState = {
					[ firstSiteId ]: {
						getAll: null,
						assign: null,
					},
				};

				deepFreeze( initialState );
				deepFreeze( action );

				expect( newState ).to.eql( expectedState );
			} );

			test( 'should set state by siteId on FAILURE', () => {
				const initialState = undefined;
				const action = {
					type: SITE_VOUCHERS_ASSIGN_REQUEST_FAILURE,
					siteId: firstSiteId,
					error: errorObject.message,
				};
				const newState = errorsReducer( initialState, action );
				const expectedState = {
					[ firstSiteId ]: {
						getAll: null,
						assign: errorObject.message,
					},
				};

				deepFreeze( action );

				expect( newState ).to.eql( expectedState );
			} );
		} );
	} );
} );
