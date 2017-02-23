/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import {
	TIMEZONES_RECEIVE,
	TIMEZONES_REQUEST_SUCCESS,
} from 'state/action-types';

import { requestTimezones } from 'state/timezones/actions';

const WP_REST_API = {
	hostname: 'https://public-api.wordpress.com',
	namespace: '/wpcom/v2',
	endpoint: '/timezones'
};

/*
 * Util functions
 */
import { fetchTimezones } from '../';

describe( 'request', () => {
	const nextSpy = sinon.spy();

	describe( 'successful requests', () => {
		useNock( ( nock ) => {
			nock( WP_REST_API.hostname )
				.persist()
				.get( WP_REST_API.namespace + WP_REST_API.endpoint )
				.reply( 200, {
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
				} );
		} );

		it( 'should dispatch SUCCESS action when request completes', done => {
			const dispatch = sinon.spy( action => {
				if ( action.type === TIMEZONES_REQUEST_SUCCESS ) {
					expect( dispatch ).to.have.been.calledWith( {
						type: TIMEZONES_REQUEST_SUCCESS
					} );
					done();
				}
			} );

			fetchTimezones( { dispatch }, requestTimezones(), nextSpy, );
		} );

		it( 'should dispatch RECEIVE action when request completes', done => {
			const responseData = {
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

			const dispatch = sinon.spy( action => {
				if ( action.type === TIMEZONES_RECEIVE ) {
					expect( dispatch ).to.have.been.calledWith( {
						type: TIMEZONES_RECEIVE,
						...responseData,
					} );
					done();
				}
			} );

			fetchTimezones( { dispatch }, requestTimezones(), nextSpy, );
		} );
	} );
} );
