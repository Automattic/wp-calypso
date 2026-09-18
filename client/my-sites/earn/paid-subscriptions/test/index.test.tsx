/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import deterministicStringify from 'fast-json-stable-stringify';
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
jest.mock( 'calypso/lib/jetpack/is-jetpack-cloud', () => () => false );

const site = { ID: 1, slug: 'example.wordpress.com' };

function createState( subscribers?: object, requestStatus?: string ) {
	const requestKey = deterministicStringify( {
		offset: 0,
		siteId: site.ID,
		type: 'MEMBERSHIPS_SUBSCRIBERS_LIST',
	} );

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

		expect( screen.getByRole( 'status', { name: 'Loading paid subscribers' } ) ).toBeVisible();
		expect(
			screen.queryByText( /You don't have any paid subscribers yet/ )
		).not.toBeInTheDocument();
	} );

	test( 'shows the empty state after an empty subscriber response', () => {
		mockState = createState( { total: 0, ownerships: {} }, 'success' );

		render( <PaidSubscriptionsSection /> );

		expect( screen.getByText( /You don't have any paid subscribers yet/ ) ).toBeVisible();
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
