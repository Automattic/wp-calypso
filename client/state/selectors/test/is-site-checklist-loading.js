/**
 * Internal dependencies
 */
import isSiteChecklistLoading from 'calypso/state/selectors/is-site-checklist-loading';
import { getRequestKey } from 'calypso/state/data-layer/wpcom-http/utils';
import { requestSiteChecklist } from 'calypso/state/checklist/actions';

describe( 'isSiteChecklistLoading()', () => {
	test( 'should return `false` by default', () => {
		const state = {
			dataRequests: {},
		};
		const isLoading = isSiteChecklistLoading( state, 1234567 );
		expect( isLoading ).toEqual( false );
	} );

	test( 'should return isLoading value', () => {
		const siteId = 1234567;
		const action = requestSiteChecklist( siteId );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};

		const isLoading = isSiteChecklistLoading( state, siteId );
		expect( isLoading ).toEqual( true );
	} );
} );
