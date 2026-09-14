/**
 * @jest-environment jsdom
 */

import { Reader, SubscriptionManager } from '@automattic/data-stores';
import { render, screen } from '@testing-library/react';
import SiteSubscriptionsListActionsBar from '../site-subscriptions-list-actions-bar';

jest.mock( '@automattic/data-stores', () => ( {
	SubscriptionManager: {
		useSiteSubscriptionsQueryProps: jest.fn(),
		useSiteSubscriptionsQuery: jest.fn(),
	},
	Reader: {
		SiteSubscriptionsSortBy: {
			LastUpdated: 'last_updated',
			DateSubscribed: 'date_subscribed',
			SiteName: 'site_name',
		},
		SiteSubscriptionsFilterBy: {
			All: 'all',
			Paid: 'paid',
			P2: 'p2',
			RSS: 'rss',
		},
	},
} ) );

jest.mock( 'calypso/landing/subscriptions/hooks', () => ( {
	useSiteSubscriptionsFilterOptions: () => [
		{ value: 'all', label: 'All' },
		{ value: 'paid', label: 'Paid' },
	],
} ) );

const mockUseSiteSubscriptionsQueryProps =
	SubscriptionManager.useSiteSubscriptionsQueryProps as jest.Mock;
const mockUseSiteSubscriptionsQuery = SubscriptionManager.useSiteSubscriptionsQuery as jest.Mock;

const defaultQueryProps = {
	searchTerm: '',
	setSearchTerm: jest.fn(),
	sortTerm: Reader.SiteSubscriptionsSortBy.LastUpdated,
	setSortTerm: jest.fn(),
	filterOption: Reader.SiteSubscriptionsFilterBy.All,
	setFilterOption: jest.fn(),
};

const renderActionsBar = ( {
	subscriptions = [],
	hasSearchMatchesWithAllFilter = true,
	isLoading = false,
}: {
	subscriptions?: Array< { isDeleted?: boolean } >;
	hasSearchMatchesWithAllFilter?: boolean;
	isLoading?: boolean;
} = {} ) => {
	mockUseSiteSubscriptionsQueryProps.mockReturnValue( defaultQueryProps );
	mockUseSiteSubscriptionsQuery.mockReturnValue( {
		data: {
			subscriptions,
			hasSearchMatchesWithAllFilter,
		},
		isLoading,
	} );

	return render( <SiteSubscriptionsListActionsBar /> );
};

describe( 'SiteSubscriptionsListActionsBar', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'disables sort when the subscribed table has no visible rows', () => {
		renderActionsBar( { subscriptions: [] } );

		const sortButton = screen.getByRole( 'button', {
			name: /Sort: Recently updated\. No subscribed sites match your search\./i,
		} );
		expect( sortButton ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( sortButton ).toHaveAttribute( 'title', 'No subscribed sites match your search.' );
	} );

	it( 'disables filter when search matches no subscriptions with filter set to All', () => {
		renderActionsBar( {
			subscriptions: [],
			hasSearchMatchesWithAllFilter: false,
		} );

		expect(
			screen.getByLabelText( 'View: All. No subscribed sites match your search.' )
		).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /View:/i } ) ).toHaveAttribute(
			'aria-disabled',
			'true'
		);
	} );

	it( 'keeps filter enabled when narrowed filter hides otherwise-matching rows', () => {
		renderActionsBar( {
			subscriptions: [],
			hasSearchMatchesWithAllFilter: true,
		} );

		expect( screen.getByRole( 'button', { name: /View:/i } ) ).toHaveAttribute(
			'aria-disabled',
			'false'
		);
	} );

	it( 'keeps filter and sort enabled while subscriptions are loading', () => {
		renderActionsBar( {
			subscriptions: [],
			hasSearchMatchesWithAllFilter: false,
			isLoading: true,
		} );

		expect( screen.getByRole( 'button', { name: /View:/i } ) ).toHaveAttribute(
			'aria-disabled',
			'false'
		);
		expect( screen.getByRole( 'button', { name: /Sort:/i } ) ).not.toBeDisabled();
	} );

	it( 'enables sort when the subscribed table has visible rows', () => {
		renderActionsBar( { subscriptions: [ { isDeleted: false } ] } );

		const sortButton = screen.getByRole( 'button', { name: /Sort: Recently updated/i } );
		expect( sortButton ).not.toBeDisabled();
		expect( sortButton ).not.toHaveAttribute( 'aria-label' );
	} );
} );
