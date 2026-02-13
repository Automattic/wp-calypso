/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import React from 'react';
import { AddSitesFormProps } from 'calypso/landing/subscriptions/components/add-sites-form/add-sites-form';
import AddSubstack from '../index';

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
jest.mock( 'calypso/reader/components/icons/substack-icon', () => () => null );
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

describe( 'AddSubstack', () => {
	describe( 'transformSubstackUrl', () => {
		beforeEach( () => {
			transformedUrl = undefined;
			render( React.createElement( AddSubstack ) );
		} );

		test( 'passes transformUrl prop to AddSitesForm', () => {
			expect( transformedUrl ).toBeDefined();
		} );

		test( 'returns non-Substack URL unchanged', () => {
			expect( transformedUrl!( 'https://www.example.com/page' ) ).toBe(
				'https://www.example.com/page'
			);
		} );

		describe( 'publication URLs', () => {
			test( 'transforms publication URL to RSS feed', () => {
				expect( transformedUrl!( 'https://example.substack.com' ) ).toBe(
					'https://example.substack.com/feed'
				);
			} );

			test( 'transforms publication URL with trailing slash', () => {
				expect( transformedUrl!( 'https://example.substack.com/' ) ).toBe(
					'https://example.substack.com/feed'
				);
			} );

			test( 'transforms publication URL with www prefix', () => {
				expect( transformedUrl!( 'https://www.example.substack.com' ) ).toBe(
					'https://www.example.substack.com/feed'
				);
			} );
		} );

		describe( 'URLs already containing /feed', () => {
			test( 'returns URL unchanged if already has /feed', () => {
				expect( transformedUrl!( 'https://example.substack.com/feed' ) ).toBe(
					'https://example.substack.com/feed'
				);
			} );

			test( 'returns URL unchanged if has /feed with trailing slash', () => {
				expect( transformedUrl!( 'https://example.substack.com/feed/' ) ).toBe(
					'https://example.substack.com/feed/'
				);
			} );
		} );
	} );
} );
