/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import SubscriberDataViews from '../subscriber-data-views';
import type { ReactNode } from 'react';

jest.mock( '@automattic/components', () => ( { Gravatar: () => null } ) );

jest.mock( '@automattic/data-stores', () => ( {
	HelpCenter: { register: () => 'help-center' },
} ) );

jest.mock( '@automattic/i18n-utils', () => ( {
	useLocalizeUrl: () => ( url: string ) => url,
} ) );

jest.mock( '@automattic/viewport-react', () => ( {
	useBreakpoint: () => false,
} ) );

jest.mock( '@wordpress/admin-ui', () => ( {
	Page: ( { children }: { children: ReactNode } ) => <>{ children }</>,
} ) );

jest.mock( '@wordpress/components', () => ( {
	Button: () => null,
	Icon: () => null,
	Spinner: () => null,
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { setShowSupportDoc: jest.fn() } ),
} ) );

jest.mock( '@wordpress/dataviews', () => ( {
	DataViews: ( { data }: { data: Array< { email_address: string } > } ) => (
		<>
			{ data.map( ( subscriber ) => (
				<div key={ subscriber.email_address }>{ subscriber.email_address }</div>
			) ) }
		</>
	),
} ) );

jest.mock( 'calypso/components/jetpack-title', () => () => null );
jest.mock( 'calypso/data/newsletter-categories', () => ( {
	useSubscribedNewsletterCategories: () => ( { data: undefined, isLoading: false } ),
} ) );
jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: object ) => unknown ) => selector( {} ),
} ) );
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	getCurrentUserLocale: () => 'en-US',
} ) );
jest.mock( 'calypso/state/memberships/product-list/selectors', () => ( {
	getProductsForSiteId: () => [],
} ) );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer', () => () => false );
jest.mock( 'calypso/state/selectors/is-site-wpcom', () => () => true );
jest.mock( 'calypso/state/selectors/is-site-wpcom-staging', () => () => false );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteSlug: () => 'example.wordpress.com',
	isSimpleSite: () => false,
} ) );

jest.mock( '../../../hooks', () => ( {
	useAddSubscribersCallback: () => jest.fn(),
	useMigrateSubscribersCallback: () => jest.fn(),
	useSubscriptionPlans: () => [],
	useUnsubscribeModal: () => ( {
		currentSubscribers: [],
		onSetUnsubscribers: jest.fn(),
		onConfirmModal: jest.fn(),
		resetSubscribers: jest.fn(),
	} ),
} ) );

jest.mock( '../../../queries', () => ( {
	useSubscriberCountQuery: () => ( { data: { total_subscribers: 0 } } ),
	useSubscriberDetailsQuery: () => ( { data: undefined, isLoading: false } ),
	useSubscribersQuery: () => ( {
		data: {
			per_page: 10,
			page: 1,
			pages: 1,
			total: 1,
			total_unfiltered: 1,
			is_owner_subscribed: false,
			subscribers: [
				{
					user_id: 0,
					email_subscription_id: 123,
					subscription_status: 'Not confirmed',
					email_address: 'pending@example.com',
					display_name: 'pending@example.com',
					avatar: '',
					email_date_subscribed: '2026-08-07T00:00:00',
				},
			],
		},
		isLoading: false,
	} ),
} ) );

jest.mock( '../../../tracks', () => ( {
	useRecordSubscriberClicked: () => jest.fn(),
	useRecordSubscriberFilter: () => jest.fn(),
	useRecordSubscriberSearch: () => jest.fn(),
	useRecordSubscriberSort: () => jest.fn(),
} ) );

jest.mock( '../../add-subscribers-modal', () => ( { AddSubscribersModal: () => null } ) );
jest.mock( '../../jetpack-empty-list-view', () => ( {
	JetpackEmptyListView: () => <div>Jetpack empty list</div>,
} ) );
jest.mock( '../../migrate-subscribers-modal', () => ( { MigrateSubscribersModal: () => null } ) );
jest.mock( '../../subscriber-details', () => ( { SubscriberDetails: () => null } ) );
jest.mock( '../../subscriber-details/skeleton', () => ( {
	SubscriberDetailsSkeleton: () => null,
} ) );
jest.mock( '../../subscriber-launchpad', () => ( {
	SubscriberLaunchpad: () => <div>Subscriber launchpad</div>,
} ) );
jest.mock( '../../subscribers-header-popover', () => ( { SubscribersHeaderPopover: () => null } ) );
jest.mock( '../../unsubscribe-modal', () => ( { UnsubscribeModal: () => null } ) );

describe( 'SubscriberDataViews', () => {
	it( 'renders pending subscribers when aggregate count is zero', () => {
		render(
			<SubscriberDataViews
				siteId={ 1 }
				isUnverified={ false }
				onCompSubscription={ jest.fn() }
				onRemoveComp={ jest.fn() }
			/>
		);

		expect( screen.getByText( 'pending@example.com' ) ).toBeVisible();
		expect( screen.getByText( '1 total subscriber' ) ).toBeVisible();
		expect( screen.queryByText( 'Jetpack empty list' ) ).not.toBeInTheDocument();
	} );
} );
