/** @format */

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { requestSegments, storeSegments, showSegmentsRequestError } from '../';
import { setSegments } from 'state/signup/segments/actions';
import { NOTICE_CREATE } from 'state/action-types';

describe( 'data-layer/wpcom/signup/segments', () => {
	test( 'requestSegments()', () => {
		const mockAction = {};
		expect( requestSegments( mockAction ) ).toEqual(
			http(
				{
					apiNamespace: 'wpcom/v2',
					method: 'GET',
					path: '/segments',
				},
				mockAction
			)
		);
	} );

	test( 'storeSegments()', () => {
		const segments = [ { id: 0 }, { id: 1 } ];

		expect( storeSegments( segments ) ).toEqual( setSegments( segments ) );
	} );

	test( 'showVerticalsRequestError()', () => {
		const errorNotice = showSegmentsRequestError();
		expect( errorNotice.type ).toEqual( NOTICE_CREATE );
		expect( errorNotice.notice.status ).toEqual( 'is-error' );
	} );
} );
