import { JETPACK_CURRENT_AGENCY_UPDATE } from '../action-types';
import { updateActiveAgencyAvailability, updateActiveAgencyLeadMatching } from '../actions';

describe( 'a8c-for-agencies agency actions', () => {
	describe( '#updateActiveAgencyLeadMatching()', () => {
		test( 'merges draft updates against the latest active agency state', () => {
			let state = {
				a8cForAgencies: {
					agencies: {
						isFetching: false,
						activeAgency: {
							id: 1,
							name: 'Agency',
							lead_matching: {
								draft: {
									regions: [ 'americas' ],
									languages: [ 'english' ],
								},
								profile: null,
								sync: undefined,
							},
						},
					},
				},
			};
			const getState = () => state;
			const dispatch = jest.fn( ( actionOrThunk ) => {
				if ( typeof actionOrThunk === 'function' ) {
					return actionOrThunk( dispatch, getState );
				}

				if ( actionOrThunk.type === JETPACK_CURRENT_AGENCY_UPDATE ) {
					state = {
						...state,
						a8cForAgencies: {
							...state.a8cForAgencies,
							agencies: {
								...state.a8cForAgencies.agencies,
								activeAgency: actionOrThunk.activeAgency,
							},
						},
					};
				}

				return actionOrThunk;
			} );

			updateActiveAgencyLeadMatching( {
				draft: {
					...state.a8cForAgencies.agencies.activeAgency.lead_matching.draft,
					businessTypes: [ 'local' ],
				},
			} )( dispatch, getState );

			updateActiveAgencyLeadMatching( {
				profile: { regions: [ 'americas' ] },
			} )( dispatch, getState );

			expect( dispatch ).toHaveBeenCalled();
			expect( state.a8cForAgencies.agencies.activeAgency.lead_matching ).toEqual( {
				draft: {
					regions: [ 'americas' ],
					languages: [ 'english' ],
					businessTypes: [ 'local' ],
				},
				profile: { regions: [ 'americas' ] },
				sync: undefined,
			} );
		} );
	} );

	describe( '#updateActiveAgencyAvailability()', () => {
		test( 'keeps agency details and lead matching availability in sync', () => {
			let state = {
				a8cForAgencies: {
					agencies: {
						isFetching: false,
						activeAgency: {
							id: 1,
							name: 'Agency',
							profile: {
								listing_details: {
									is_available: true,
								},
							},
							lead_matching: {
								profile: {
									availability: {
										accepting_work: true,
									},
								},
							},
						},
					},
				},
			};
			const getState = () => state;
			const dispatch = jest.fn( ( actionOrThunk ) => {
				if ( typeof actionOrThunk === 'function' ) {
					return actionOrThunk( dispatch, getState );
				}

				if ( actionOrThunk.type === JETPACK_CURRENT_AGENCY_UPDATE ) {
					state = {
						...state,
						a8cForAgencies: {
							...state.a8cForAgencies,
							agencies: {
								...state.a8cForAgencies.agencies,
								activeAgency: actionOrThunk.activeAgency,
							},
						},
					};
				}

				return actionOrThunk;
			} );

			updateActiveAgencyAvailability( false )( dispatch, getState );

			expect(
				state.a8cForAgencies.agencies.activeAgency.profile.listing_details.is_available
			).toBe( false );
			expect(
				state.a8cForAgencies.agencies.activeAgency.lead_matching.profile.availability.accepting_work
			).toBe( false );
		} );
	} );
} );
