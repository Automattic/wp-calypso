/**
 * Internal Dependencies
 */
import { fetchExperiments, experimentUpdate } from 'state/data-layer/wpcom/experiments';
import { EXPERIMENT_ASSIGN, EXPERIMENT_FETCH } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	describe( 'experiments', () => {
		describe( '#fetchExperiments', () => {
			test( 'should dispatch request to experiments endpoint', () => {
				const action = { type: EXPERIMENT_FETCH, anonId: 'abc' };
				expect( fetchExperiments( action ) ).toEqual(
					http(
						{
							apiNamespace: 'wpcom',
							method: 'GET',
							path: '/v2/experiments/calypso',
							query: {
								anonId: 'abc',
							},
						},
						action
					)
				);
			} );
		} );

		describe( '#experimentUpdate', () => {
			test( 'should dispatch updated action', () => {
				const action = { type: EXPERIMENT_FETCH, anonId: 'abc' };
				const data = {
					variations: {
						experiment_a: null,
						experiment_b: 'variation',
					},
					nextRefresh: 123,
				};

				expect( experimentUpdate( action, data ) ).toEqual( {
					type: EXPERIMENT_ASSIGN,
					nextRefresh: 123,
					variations: {
						experiment_a: null,
						experiment_b: 'variation',
					},
				} );
			} );
		} );
	} );
} );
