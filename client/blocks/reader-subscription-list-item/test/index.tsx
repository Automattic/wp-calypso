/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { useFeedQuery } from 'calypso/reader/data/feed';
import { useSiteSubscriptionForFeed } from 'calypso/reader/data/site-subscriptions';
import ReaderSubscriptionListItem from '..';

jest.mock( 'calypso/reader/data/feed', () => ( {
	useFeedQuery: jest.fn(),
} ) );

jest.mock( 'calypso/reader/data/site-subscriptions', () => ( {
	getFollowingSource: jest.fn(),
	useSiteSubscriptionForFeed: jest.fn(),
	useFollowSite: jest.fn( () => ( { mutate: jest.fn(), isPending: false } ) ),
	useIsSubscribed: jest.fn( () => false ),
	useUnfollowSite: jest.fn( () => ( { mutate: jest.fn(), isPending: false } ) ),
} ) );

const defaultStoreState = {
	currentUser: { id: 123 },
};

const mockUseFeedQuery = useFeedQuery as jest.Mock;
const mockUseFollowForFeed = useSiteSubscriptionForFeed as jest.Mock;

const renderComponent = (
	props: ComponentProps< typeof ReaderSubscriptionListItem > = {},
	storeState = defaultStoreState
) => {
	const store = configureStore()( storeState );
	const defaultProps: ComponentProps< typeof ReaderSubscriptionListItem > = {
		feedId: 123,
		siteId: 456,
		followSource: 'test-source',
		onItemClick: jest.fn(),
		...props,
	};

	return render(
		<Provider store={ store }>
			<ReaderSubscriptionListItem { ...defaultProps } />
		</Provider>
	);
};

const getFollowButton = () => document.querySelector( '.follow-button' );
const getSiteTitleLink = () => document.querySelector( '.reader-subscription-list-item__link' );
const getSiteUrlLink = () => document.querySelector( '.reader-subscription-list-item__site-url' );
const getPlaceholder = () =>
	document.querySelector( '.reader-subscription-list-item__placeholder' );

describe( 'ReaderSubscriptionListItem', () => {
	beforeEach( () => {
		mockUseFeedQuery.mockReturnValue( { data: undefined, isError: false } );
		mockUseFollowForFeed.mockReturnValue( undefined );
	} );

	it( 'should render placeholder when no site, feed, or potential feed URL exists', () => {
		renderComponent( {
			url: undefined,
			feedId: undefined,
			siteId: undefined,
		} );

		expect( getPlaceholder() ).toBeVisible();
		expect( getFollowButton() ).not.toBeInTheDocument();
	} );

	it( 'should not render placeholder when a potential feed URL is provided', () => {
		renderComponent( {
			url: 'https://example.com/feed/rss',
			feedId: undefined,
			siteId: undefined,
		} );

		expect( getPlaceholder() ).not.toBeInTheDocument();
		expect( getFollowButton() ).toBeVisible();
	} );

	it( 'should use formatted feed URL when no site or feed exists', () => {
		renderComponent( {
			url: 'https://example.com/feed/rss',
			feedId: undefined,
			siteId: undefined,
		} );

		expect( getSiteTitleLink() ).toHaveTextContent( 'example.com/feed/rss' );
		expect( getSiteTitleLink() ).toHaveAttribute( 'href', 'https://example.com/feed/rss' );

		expect( getSiteUrlLink() ).toBeVisible();
		expect( getSiteUrlLink() ).toHaveAttribute( 'href', 'https://example.com/feed/rss' );
	} );

	it( 'should render normally when site data exists', () => {
		mockUseFeedQuery.mockReturnValue( {
			data: {
				feed_ID: 123,
				name: 'Test Blog',
				URL: 'https://testblog.com',
				feed_URL: 'https://testblog.com/feed',
			},
			isError: false,
		} );

		renderComponent( { feedId: 123 } );

		expect( getSiteTitleLink() ).toBeVisible();
		expect( getSiteTitleLink() ).toHaveTextContent( 'Test Blog' );
		expect( getSiteTitleLink() ).toHaveAttribute( 'href', '/reader/feeds/123' );

		expect( getSiteUrlLink() ).toBeVisible();
		expect( getSiteUrlLink() ).toHaveAttribute( 'href', 'https://testblog.com' );
	} );

	it( 'should return null when feed has an error', () => {
		mockUseFeedQuery.mockReturnValue( { data: undefined, isError: true } );

		const { container } = renderComponent( { feedId: 123 } );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should return null when site has an error', () => {
		const { container } = renderComponent( { site: { is_error: true } } );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
