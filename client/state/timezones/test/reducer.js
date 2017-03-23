/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';

import timezonesReducer, {
	byContinents,
	labels,
	isRequesting,
	rawOffsets,
} from '../reducer';

import {
	requestTimezones,
	timezonesRequestSuccess,
	timezonesReceive,
	timezonesRequestFailure,
} from '../actions';

describe( 'reducer', () => {
	let sandbox;

	useSandbox( newSandbox => {
		sandbox = newSandbox;
		sandbox.stub( console, 'warn' );
	} );

	it( 'should export expected reducer keys', () => {
		expect( timezonesReducer( undefined, {} ) ).to.have.keys( [
			'byContinents',
			'labels',
			'rawOffsets',
			'isRequesting'
		] );
	} );

	describe( '#rawOffsets()', () => {
		it( 'should default to an empty action object', () => {
			expect( rawOffsets( undefined, {} ) ).to.eql( {} );
		} );

		it( 'should index `rawOffsets` state', () => {
			const initialState = undefined;

			const action = timezonesReceive( {
				rawOffsets: {
					'UTC+0': 'UTC',
					'UTC-12': 'UTC-12',
					'UTC-11.5': 'UTC-11:30',
				}
			} );

			const expectedState = {
				'UTC+0': 'UTC',
				'UTC-12': 'UTC-12',
				'UTC-11.5': 'UTC-11:30',
			};

			const newState = rawOffsets( initialState, action );
			expect( newState ).to.eql( expectedState );
		} );

		it( 'should override `rawOffsets` state', () => {
			const initialState = {
				'UTC+13.75': 'UTC+13:45',
				'UTC+14': 'UTC+14',
			};
			deepFreeze( initialState );

			const action = timezonesReceive( {
				rawOffsets: {
					'UTC+0': 'UTC',
					'UTC-12': 'UTC-12',
					'UTC-11.5': 'UTC-11:30',
				}
			} );

			const expectedState = {
				'UTC+0': 'UTC',
				'UTC-12': 'UTC-12',
				'UTC-11.5': 'UTC-11:30',
			};

			const newState = rawOffsets( initialState, action );
			expect( newState ).to.eql( expectedState );
		} );

		it( 'should persist state', () => {
			const initialState = {
				rawOffsets: {
					'UTC+13.75': 'UTC+13:45',
					'UTC+14': 'UTC+14',
				}
			};
			deepFreeze( initialState );

			const action = { type: 'SERIALIZE' };
			const expectedState = initialState;
			const newState = rawOffsets( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		it( 'should load persisted state', () => {
			const initialState = {
				'UTC+0': 'UTC',
				'UTC+13.75': 'UTC+13:45',
				'UTC+14': 'UTC+14',
			};
			deepFreeze( initialState );

			const action = { type: 'DESERIALIZE' };
			const expectedState = initialState;
			const newState = rawOffsets( initialState, action );
			expect( newState ).to.eql( expectedState );
		} );

		it( 'should not load invalid persisted state', () => {
			const initialStateONE = { rawOffsets: { foo: 'bar' } };
			deepFreeze( initialStateONE );
			const newStateONE = rawOffsets( initialStateONE, { type: 'DESERIALIZE' } );

			// 'UTC' shouldn't be allowed either.
			const initialStateTWO = { rawOffsets: { UTC: 'UTC' } };
			deepFreeze( initialStateTWO );
			const newStateTWO = rawOffsets( initialStateTWO, { type: 'DESERIALIZE' } );

			expect( newStateONE ).to.eql( {} );
			expect( newStateTWO ).to.eql( {} );
		} );
	} );

	describe( '#labels()', () => {
		it( 'should default to an empty action object', () => {
			expect( rawOffsets( undefined, {} ) ).to.eql( {} );
		} );

		it( 'should index `labels` state', () => {
			const initialState = undefined;

			const action = timezonesReceive( {
				labels: {
					'Asia/Aqtobe': 'Aqtobe',
					'America/Boa_Vista': 'Boa Vista',
					'Indian/Comoro': 'Comoro',
				}
			} );

			const expectedState = {
				'Asia/Aqtobe': 'Aqtobe',
				'America/Boa_Vista': 'Boa Vista',
				'Indian/Comoro': 'Comoro',
			};

			const newState = labels( initialState, action );
			expect( newState ).to.eql( expectedState );
		} );

		it( 'should override `labels` state', () => {
			const initialState = {
				'Australia/Currie': 'Currie',
				'Indian/Mauritius': 'Mauritius',
			};
			deepFreeze( initialState );

			const action = timezonesReceive( {
				labels: {
					'Asia/Aqtobe': 'Aqtobe',
					'America/Boa_Vista': 'Boa Vista',
					'Indian/Comoro': 'Comoro',
				}
			} );

			const expectedState = {
				'Asia/Aqtobe': 'Aqtobe',
				'America/Boa_Vista': 'Boa Vista',
				'Indian/Comoro': 'Comoro',
			};

			const newState = labels( initialState, action );
			expect( newState ).to.eql( expectedState );
		} );

		it( 'should persist state', () => {
			const initialState = {
				labels: {
					'Asia/Aqtobe': 'Aqtobe',
					'America/Boa_Vista': 'Boa Vista',
					'Indian/Comoro': 'Comoro',
				}
			};
			deepFreeze( initialState );

			const action = { type: 'SERIALIZE' };
			const expectedState = initialState;
			const newState = labels( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		it( 'should load persisted state', () => {
			const initialState = {
				'Asia/Aqtobe': 'Aqtobe',
				'America/Boa_Vista': 'Boa Vista',
				'Indian/Comoro': 'Comoro',
			};
			deepFreeze( initialState );

			const action = { type: 'DESERIALIZE' };
			const expectedState = initialState;
			const newState = labels( initialState, action );
			expect( newState ).to.eql( expectedState );
		} );

		it( 'should not load invalid persisted state', () => {
			const initialStateONE = { labels: { foo: 'bar' } };
			deepFreeze( initialStateONE );
			const newStateONE = labels( initialStateONE, { type: 'DESERIALIZE' } );
			expect( newStateONE ).to.eql( {} );
		} );
	} );

	describe( '#byContinents()', () => {
		it( 'should default to an empty action object', () => {
			expect( rawOffsets( undefined, {} ) ).to.eql( {} );
		} );

		it( 'should index `rawOffsets` state', () => {
			const initialState = undefined;

			const action = timezonesReceive( {
				byContinents: {
					Asia: [
						'Asia/Aqtobe',
					],
					America: [
						'America/Blanc-Sablon',
						'America/Boa_Vista',
					],
					Indian: [
						'Indian/Comoro',
					],
				},

			} );

			const expectedState = {
				Asia: [
					'Asia/Aqtobe',
				],
				America: [
					'America/Blanc-Sablon',
					'America/Boa_Vista',
				],
				Indian: [
					'Indian/Comoro',
				],
			};

			const newState = byContinents( initialState, action );
			expect( newState ).to.eql( expectedState );
		} );

		it( 'should override timezones.byContinents state', () => {
			const initialState = {
				Pacific: [
					'Pacific/Funafuti',
				]
			};
			deepFreeze( initialState );

			const action = timezonesReceive( {
				byContinents: {
					Asia: [
						'Asia/Aqtobe',
					],
					America: [
						'America/Blanc-Sablon',
						'America/Boa_Vista',
					],
					Indian: [
						'Indian/Comoro',
					],
				},

			} );

			const expectedState = {
				Asia: [
					'Asia/Aqtobe',
				],
				America: [
					'America/Blanc-Sablon',
					'America/Boa_Vista',
				],
				Indian: [
					'Indian/Comoro',
				],
			};

			const newState = byContinents( initialState, action );
			expect( newState ).to.eql( expectedState );
		} );

		it( 'should persist state', () => {
			const initialState = {
				byContinents: {
					Asia: [
						'Asia/Aqtobe',
					],
					America: [
						'America/Blanc-Sablon',
						'America/Boa_Vista',
					],
					Indian: [
						'Indian/Comoro',
					],
				},

			};
			deepFreeze( initialState );

			const action = { type: 'SERIALIZE' };
			const expectedState = initialState;
			const newState = byContinents( initialState, action );

			expect( newState ).to.eql( expectedState );
		} );

		it( 'should load persisted state', () => {
			const initialState = {
				Asia: [
					'Asia/Aqtobe',
				],
				America: [
					'America/Blanc-Sablon',
					'America/Boa_Vista',
				],
				Indian: [
					'Indian/Comoro',
				],
			};
			deepFreeze( initialState );

			const action = { type: 'DESERIALIZE' };
			const expectedState = initialState;
			const newState = byContinents( initialState, action );
			expect( newState ).to.eql( expectedState );
		} );

		it( 'should not load invalid persisted state', () => {
			const initialStateONE = { byContinents: { foo: 'bar' } };
			deepFreeze( initialStateONE );
			const newStateONE = byContinents( initialStateONE, { type: 'DESERIALIZE' } );
			expect( newStateONE ).to.eql( {} );
		} );
	} );

	describe( '#isRequesting()', () => {
		it( 'should default `isRequesting` to an empty action object', () => {
			expect( isRequesting( undefined, {} ) ).to.eql( false );
		} );

		describe( 'requestTimezones() action', () => {
			it( 'should index `isRequesting` state', () => {
				const action = requestTimezones();
				const newState = isRequesting( undefined, action );
				expect( newState ).to.eql( true );
			} );

			it( 'should override `isRequesting` state', () => {
				const action = requestTimezones();
				const newState = isRequesting( false, action );
				expect( newState ).to.eql( true );
			} );
		} );

		describe( 'timezonesRequestSuccess() action', () => {
			it( 'should index `isRequesting` state', () => {
				const action = timezonesRequestSuccess();
				const newState = isRequesting( undefined, action );
				expect( newState ).to.eql( false );
			} );

			it( 'should override `isRequesting` state', () => {
				const action = timezonesRequestSuccess();
				const newState = isRequesting( true, action );
				expect( newState ).to.eql( false );
			} );
		} );

		describe( 'timezonesRequestFailure() action', () => {
			it( 'should index `isRequesting` state', () => {
				const action = timezonesRequestFailure();
				const newState = isRequesting( undefined, action );
				expect( newState ).to.eql( false );
			} );

			it( 'should override `isRequesting` state', () => {
				const action = timezonesRequestFailure();
				const newState = isRequesting( true, action );
				expect( newState ).to.eql( false );
			} );
		} );
	} );
} );
