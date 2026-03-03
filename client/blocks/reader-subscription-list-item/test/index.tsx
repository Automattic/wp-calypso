/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ReaderSubscriptionListItem from '..';

const defaultStoreState = {
	reader: {
		feeds: { items: {} },
		follows: { items: {} },
	},
	currentUser: { id: 123 },
};

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
		const storeState = {
			...defaultStoreState,
			reader: {
				...defaultStoreState.reader,
				feeds: {
					items: {
						123: {
							feed_ID: 123,
							name: 'Test Blog',
							URL: 'https://testblog.com',
							feed_URL: 'https://testblog.com/feed',
						},
					},
				},
			},
		};

		renderComponent( { feedId: 123 }, storeState );

		expect( getSiteTitleLink() ).toBeVisible();
		expect( getSiteTitleLink() ).toHaveTextContent( 'Test Blog' );
		expect( getSiteTitleLink() ).toHaveAttribute( 'href', '/reader/feeds/123' );

		expect( getSiteUrlLink() ).toBeVisible();
		expect( getSiteUrlLink() ).toHaveAttribute( 'href', 'https://testblog.com' );
	} );

	it( 'should return null when feed has an error', () => {
		const storeState = {
			...defaultStoreState,
			reader: {
				...defaultStoreState.reader,
				feeds: {
					items: {
						123: {
							feed_ID: 123,
							is_error: true,
						},
					},
				},
			},
		};

		const { container } = renderComponent( { feedId: 123 }, storeState );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should return null when site has an error', () => {
		const { container } = renderComponent( { site: { is_error: true } } );

		expect( container ).toBeEmptyDOMElement();
	} );
} );
