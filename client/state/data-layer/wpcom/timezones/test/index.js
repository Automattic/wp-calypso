/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';

// import { useSandbox } from 'test/helpers/use-sinon';
// import useNock from 'test/helpers/use-nock';

import {
	timezonesReceive as timezonesReceiveAction,
	timezonesRequestSuccess as timezonesRequestSuccessAction,
	timezonesRequestFailure as timezonesRequestFailureAction,
} from 'state/timezones/actions';

/*
 * Util functions
 */
import {
	requestTimezones,
	receiveTimezones,
	receiveError,
} from '../';

describe( 'successful requests', () => {
	describe( 'requestTimezones', () => {
		it( 'should dispatch HTTP request to timezones endpoint', () => {
			const action = { type: 'DUMMY' };
			const dispatch = spy();
			const next = spy();

			requestTimezones( { dispatch }, action, next );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith( http( {
				apiNamespace: 'wpcom/v2',
				method: 'GET',
				path: '/timezones',
				onSuccess: action,
				onFailure: action,
			} ) );
		} );

		it( 'should pass the original action along the middleware chain', () => {
			const action = { type: 'DUMMY' };
			const dispatch = spy();
			const next = spy();

			requestTimezones( { dispatch }, action, next );

			expect( next ).to.have.been.calledWith( action );
		} );
	} );

	describe( 'receiveTimezones', () => {
		it( 'should dispatch timezones updates', () => {
			const endpointResponseData = {
				found: 100,
				manual_utc_offsets: [
					{ value: 'UTC+0', label: 'UTC' },
					{ value: 'UTC+13.75', label: 'UTC+13:45' },
					{ value: 'UTC+14', label: 'UTC+14' },
				],
				timezones: [
					{ value: 'Asia/Aqtobe', label: 'Aqtobe' },
					{ value: 'America/Boa_Vista', label: 'Boa Vista' },
					{ value: 'Indian/Comoro', label: 'Comoro' },
				],
				timezones_by_continent: {
					Asia: [
						{ value: 'Asia/Aqtobe', label: 'Aqtobe' },
					],
					America: [
						{ value: 'America/Blanc-Sablon', label: 'Blanc-Sablon' },
						{ value: 'America/Boa_Vista', label: 'Boa Vista' },
					],
					Indian: [
						{ value: 'Indian/Comoro', label: 'Comoro' },
					]
				}
			};

			const receiveActionData = {
				rawOffsets: {
					'UTC+0': 'UTC',
					'UTC+13.75': 'UTC+13:45',
					'UTC+14': 'UTC+14',
				},

				labels: {
					'Asia/Aqtobe': 'Aqtobe',
					'America/Boa_Vista': 'Boa Vista',
					'Indian/Comoro': 'Comoro',
				},
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

			const action = timezonesReceiveAction( receiveActionData );
			const dispatch = spy();
			const next = spy();

			receiveTimezones( { dispatch }, action, next, endpointResponseData );

			expect( dispatch ).to.have.been.calledTwice;
			expect( dispatch ).to.have.been.calledWith( timezonesRequestSuccessAction() );
			expect( dispatch ).to.have.been.calledWith( timezonesReceiveAction( receiveActionData ) );
		} );
	} );
} );

describe( 'failed requests', () => {
	describe( '#receiveError', () => {
		it( 'should dispatch error', () => {
			const error = 'Internal Server Error';
			const action = timezonesRequestFailureAction( error );
			const dispatch = spy();
			const next = spy();

			receiveError( { dispatch }, action, next, error );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith( timezonesRequestFailureAction( error ) );
		} );
	} );
} );
