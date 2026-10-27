/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getRequestKey } from 'calypso/state/data-layer/wpcom-http/utils';
import { requestSubscribers } from 'calypso/state/memberships/subscribers/actions';
import PaidSubscriptionsSection from '..';

const mockDispatch = jest.fn();
let mockState: Record< string, unknown >;

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: ( selector: ( currentState: Record< string, unknown > ) => unknown ) =>
		selector( mockState ),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	...jest.requireActual( 'i18n-calypso' ),
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( 'calypso/components/localized-moment', () => ( {
	useLocalizedMoment: () => () => ( { format: () => '' } ),
} ) );

jest.mock( 'calypso/components/data/query-memberships-earnings', () => () => null );
jest.mock( 'calypso/components/data/query-memberships-settings', () => () => null );
jest.mock( 'calypso/components/gravatar', () => () => null );
jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud', () => () => false );

const site = { ID: 1, slug: 'example.wordpress.com' };

const paidSubscriberList = {
	total: 1,
	ownerships: {
		10: {
			id: '10',
			user: { ID: 5, name: 'Ada Lovelace', user_email: 'ada@example.com' },
			plan: {
				title: 'Newsletter',
				renew_interval: '1 month',
				renewal_price: 5,
				currency: 'USD',
			},
			all_time_total: 5,
			start_date: '2020-01-01 00:00:00',
		},
	},
};

function createState( subscribers?: object, requestStatus?: string ) {
	const requestKey = getRequestKey( requestSubscribers( site.ID, 0 ) );

	return {
		ui: { selectedSiteId: site.ID },
		sites: { items: { [ site.ID ]: site } },
		memberships: { subscribers: { list: subscribers ? { [ site.ID ]: subscribers } : {} } },
		dataRequests: requestStatus ? { [ requestKey ]: { status: requestStatus } } : {},
	};
}

describe( 'PaidSubscriptionsSection', () => {
	beforeEach( () => {
		mockDispatch.mockClear();
	} );

	test( 'shows a loader before the first subscriber response', () => {
		mockState = createState();

		render( <PaidSubscriptionsSection /> );

		const status = screen.getByRole( 'status' );
		expect( status ).toBeVisible();
		expect( status ).toHaveTextContent( 'Loading paid subscribers' );
		expect(
			screen.queryByText( /You don't have any paid subscribers yet/ )
		).not.toBeInTheDocument();
	} );

	test( 'shows the empty state after an empty subscriber response', () => {
		mockState = createState( { total: 0, ownerships: {} }, 'success' );

		render( <PaidSubscriptionsSection /> );

		expect( screen.getByText( /You don't have any paid subscribers yet/ ) ).toBeVisible();
	} );

	test( 'shows subscribers after a populated response', () => {
		mockState = createState( paidSubscriberList, 'success' );

		render( <PaidSubscriptionsSection /> );

		expect( screen.getByText( 'Ada Lovelace' ) ).toBeVisible();
		expect(
			screen.queryByText( /You don't have any paid subscribers yet/ )
		).not.toBeInTheDocument();
		expect( screen.queryByRole( 'alert' ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the subscriber list when a later request fails', () => {
		mockState = createState( paidSubscriberList, 'failure' );

		render( <PaidSubscriptionsSection /> );

		expect( screen.getByText( 'Ada Lovelace' ) ).toBeVisible();
		expect( screen.queryByRole( 'alert' ) ).not.toBeInTheDocument();
		expect(
			screen.queryByText( /You don't have any paid subscribers yet/ )
		).not.toBeInTheDocument();
	} );

	test( 'shows a retryable error after the first request fails', async () => {
		const user = userEvent.setup();
		mockState = createState( undefined, 'failure' );

		render( <PaidSubscriptionsSection /> );

		expect( screen.getByRole( 'alert' ) ).toHaveTextContent(
			'We couldn’t load your paid subscribers. Please try again.'
		);

		mockDispatch.mockClear();
		await user.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		expect( mockDispatch ).toHaveBeenCalledWith( {
			meta: { dataLayer: { trackRequest: true } },
			offset: 0,
			siteId: site.ID,
			type: 'MEMBERSHIPS_SUBSCRIBERS_LIST',
		} );
	} );
} );
