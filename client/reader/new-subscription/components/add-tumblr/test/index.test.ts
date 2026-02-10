/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import React from 'react';
import { AddSitesFormProps } from 'calypso/landing/subscriptions/components/add-sites-form/add-sites-form';
import AddTumblr from '../index';

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
jest.mock( 'calypso/reader/components/icons/tumblr-icon', () => () => null );
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

describe( 'AddTumblr', () => {
	describe( 'transformTumblrUrl', () => {
		beforeEach( () => {
			transformedUrl = undefined;
			render( React.createElement( AddTumblr ) );
		} );

		test( 'passes transformUrl prop to AddSitesForm', () => {
			expect( transformedUrl ).toBeDefined();
		} );

		test( 'returns URL unchanged if already has /rss', () => {
			expect( transformedUrl!( 'https://staff.tumblr.com/rss' ) ).toBe(
				'https://staff.tumblr.com/rss'
			);
		} );

		test( 'returns non-Tumblr URL unchanged', () => {
			expect( transformedUrl!( 'https://www.example.com/page' ) ).toBe(
				'https://www.example.com/page'
			);
		} );

		test( 'returns invalid URL unchanged', () => {
			expect( transformedUrl!( 'not-a-valid-url' ) ).toBe( 'not-a-valid-url' );
		} );

		describe( 'blog URLs', () => {
			test( 'transforms blog URL to RSS feed', () => {
				expect( transformedUrl!( 'https://staff.tumblr.com' ) ).toBe(
					'https://staff.tumblr.com/rss'
				);
			} );

			test( 'transforms blog URL with trailing slash', () => {
				expect( transformedUrl!( 'https://staff.tumblr.com/' ) ).toBe(
					'https://staff.tumblr.com/rss'
				);
			} );

			test( 'transforms subdomain blog URL to RSS feed', () => {
				expect( transformedUrl!( 'https://example.tumblr.com' ) ).toBe(
					'https://example.tumblr.com/rss'
				);
			} );
		} );

		describe( 'blog tag URLs', () => {
			test( 'transforms tagged URL to RSS feed', () => {
				expect( transformedUrl!( 'https://example.tumblr.com/tagged/photography' ) ).toBe(
					'https://example.tumblr.com/tagged/photography/rss'
				);
			} );

			test( 'transforms tagged URL with trailing slash', () => {
				expect( transformedUrl!( 'https://example.tumblr.com/tagged/photography/' ) ).toBe(
					'https://example.tumblr.com/tagged/photography/rss'
				);
			} );
		} );
	} );
} );
