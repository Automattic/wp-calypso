/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	fetchConciergeShifts,
	storeFetchedConciergeShifts,
	showConciergeShiftsFetchError,
} from '../';
import { updateConciergeShifts } from 'state/concierge/actions';
import { CONCIERGE_SHIFTS_REQUEST, NOTICE_CREATE } from 'state/action-types';

describe( 'wpcom-api', () => {
	describe( 'concierge', () => {
		test( 'fetchConciergeShifts()', () => {
			const dispatch = jest.fn();
			const action = {
				type: CONCIERGE_SHIFTS_REQUEST,
				scheduleId: 123,
			};

			fetchConciergeShifts( { dispatch }, action );

			expect( dispatch ).toHaveBeenCalledWith(
				http(
					{
						method: 'GET',
						path: `/concierge/schedules/${ action.scheduleId }/shifts`,
						apiNamespace: 'wpcom/v2',
					},
					action
				)
			);
		} );

		test( 'storeFetchedConciergeShifts()', () => {
			const dispatch = jest.fn();
			const mockShifts = [
				{ description: 'shift 1' },
				{ description: 'shift 2' },
				{ description: 'shift 3' },
			];

			storeFetchedConciergeShifts( { dispatch }, {}, mockShifts );

			expect( dispatch ).toHaveBeenCalledWith( updateConciergeShifts( mockShifts ) );
		} );

		test( 'showConciergeShiftsFetchError()', () => {
			const dispatch = jest.fn();

			showConciergeShiftsFetchError( { dispatch } );

			// the reason that we don't use `errorNotice` action creator here is that
			// it contains the side effect that increments `notice.noticeId` field automatically.
			// Thus:
			// const notice1 = errorNotice( 'message' );
			// const notice2 = errorNotice( 'message' );
			// notice1 and notice2 are actually non-equal, since notice1.notice.noticeId is 1 while
			// notice2.notice.noticeId is 2.
			// Instead of hacking out the underlying id, I think using partial matching here would be more sustainable.
			expect( dispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					type: NOTICE_CREATE,
					notice: expect.objectContaining( {
						status: 'is-error',
						text: "We couldn't load our Concierge schedule. Please try again later.",
					} ),
				} )
			);
		} );
	} );
} );
