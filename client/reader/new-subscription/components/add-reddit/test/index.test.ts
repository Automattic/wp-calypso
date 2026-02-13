/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import React from 'react';
import { AddSitesFormProps } from 'calypso/landing/subscriptions/components/add-sites-form/add-sites-form';
import AddReddit from '../index';

let transformedUrl: ( ( url: string ) => string ) | undefined;

jest.mock( '../style.scss', () => ( {} ) );
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: jest.fn( () => ( text: string ) => text ),
} ) );
jest.mock( 'react-redux', () => ( {
	useDispatch: jest.fn( () => jest.fn() ),
	useSelector: jest.fn( () => {} ),
} ) );
jest.mock( 'calypso/landing/subscriptions/components/add-sites-form', () => ( {
	AddSitesForm: ( props: AddSitesFormProps ) => {
		transformedUrl = props.transformUrl;
		return null;
	},
} ) );
jest.mock( 'calypso/landing/subscriptions/components/subscription-manager-context', () => ( {
	SubscriptionManagerContextProvider: ( { children }: { children: React.ReactNode } ) => children,
	SubscriptionsPortal: { Reader: 'reader' },
} ) );
jest.mock( 'calypso/reader/components/icons/reddit-icon', () => () => null );
jest.mock( 'calypso/reader/utils', () => ( {
	isDiscoverV3Enabled: jest.fn( () => true ),
} ) );
jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn( () => true ),
} ) );
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	isCurrentUserEmailVerified: jest.fn( () => true ),
} ) );
jest.mock( 'calypso/state/reader/follows/actions', () => ( {
	requestFollows: jest.fn(),
} ) );
jest.mock( 'calypso/components/notice', () => () => null );

describe( 'AddReddit', () => {
	describe( 'transformRedditUrl', () => {
		beforeEach( () => {
			transformedUrl = undefined;
			render( React.createElement( AddReddit ) );
		} );

		test( 'passes transformUrl prop to AddSitesForm', () => {
			expect( transformedUrl ).toBeDefined();
		} );

		describe( 'subreddit URLs', () => {
			test( 'transforms subreddit URL to RSS feed', () => {
				expect( transformedUrl!( 'https://www.reddit.com/r/javascript' ) ).toBe(
					'https://www.reddit.com/r/javascript/.rss'
				);
			} );

			test( 'transforms subreddit URL with trailing slash', () => {
				expect( transformedUrl!( 'https://www.reddit.com/r/javascript/' ) ).toBe(
					'https://www.reddit.com/r/javascript/.rss'
				);
			} );
		} );

		describe( 'user URLs', () => {
			test( 'transforms user URL to RSS feed', () => {
				expect( transformedUrl!( 'https://www.reddit.com/user/example' ) ).toBe(
					'https://www.reddit.com/user/example/.rss'
				);
			} );

			test( 'transforms user comments URL to RSS feed', () => {
				expect( transformedUrl!( 'https://www.reddit.com/user/example/comments' ) ).toBe(
					'https://www.reddit.com/user/example/comments/.rss'
				);
			} );

			test( 'transforms user submitted URL to RSS feed', () => {
				expect( transformedUrl!( 'https://www.reddit.com/user/example/submitted' ) ).toBe(
					'https://www.reddit.com/user/example/submitted/.rss'
				);
			} );
		} );

		describe( 'front page URLs', () => {
			test( 'transforms front page URL to RSS feed', () => {
				expect( transformedUrl!( 'https://www.reddit.com' ) ).toBe( 'https://www.reddit.com/.rss' );
			} );

			test( 'transforms front page URL with trailing slash', () => {
				expect( transformedUrl!( 'https://www.reddit.com/' ) ).toBe(
					'https://www.reddit.com/.rss'
				);
			} );
		} );

		describe( 'search URLs', () => {
			test( 'transforms search URL to RSS feed', () => {
				expect( transformedUrl!( 'https://www.reddit.com/search?q=javascript' ) ).toBe(
					'https://www.reddit.com/search.rss?q=javascript'
				);
			} );

			test( 'transforms search URL with trailing slash', () => {
				expect( transformedUrl!( 'https://www.reddit.com/search/?q=javascript' ) ).toBe(
					'https://www.reddit.com/search.rss?q=javascript'
				);
			} );
		} );

		describe( 'URLs already containing .rss', () => {
			test( 'returns URL unchanged if already has .rss', () => {
				expect( transformedUrl!( 'https://www.reddit.com/r/javascript/.rss' ) ).toBe(
					'https://www.reddit.com/r/javascript/.rss'
				);
			} );

			test( 'returns search RSS URL unchanged', () => {
				expect( transformedUrl!( 'https://www.reddit.com/search.rss?q=test' ) ).toBe(
					'https://www.reddit.com/search.rss?q=test'
				);
			} );
		} );

		describe( 'non-Reddit URLs', () => {
			test( 'returns non-Reddit URL unchanged', () => {
				expect( transformedUrl!( 'https://www.example.com/page' ) ).toBe(
					'https://www.example.com/page'
				);
			} );

			test( 'returns WordPress URL unchanged', () => {
				expect( transformedUrl!( 'https://wordpress.com/blog' ) ).toBe(
					'https://wordpress.com/blog'
				);
			} );

			test( 'returns invalid URL unchanged', () => {
				expect( transformedUrl!( 'not-a-valid-url' ) ).toBe( 'not-a-valid-url' );
			} );

			test( 'returns empty string unchanged', () => {
				expect( transformedUrl!( '' ) ).toBe( '' );
			} );
		} );
	} );
} );
