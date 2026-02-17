/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import AddTumblr from '../index';

const mockIsCurrentUserEmailVerified = jest.fn( () => true );

jest.mock( '../style.scss', () => ( {} ) );
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: jest.fn( () => ( text: string ) => text ),
} ) );
jest.mock( 'react-redux', () => ( {
	useDispatch: jest.fn( () => jest.fn() ),
	useSelector: jest.fn( () => {} ),
} ) );
jest.mock( 'calypso/landing/subscriptions/components/add-sites-form', () => ( {
	AddSitesForm: () => {
		return <div data-testid="add-sites-form">AddSitesForm</div>;
	},
} ) );
jest.mock( 'calypso/landing/subscriptions/components/subscription-manager-context', () => ( {
	SubscriptionManagerContextProvider: ( { children }: { children: React.ReactNode } ) => children,
	SubscriptionsPortal: { Reader: 'reader' },
} ) );
jest.mock( 'calypso/reader/components/icons/tumblr-icon', () => () => (
	<div data-testid="tumblr-icon">Tumblr Icon</div>
) );
jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn( ( selector: () => boolean ) => selector() ),
} ) );
jest.mock( 'calypso/state/current-user/selectors', () => ( {
	isCurrentUserEmailVerified: () => mockIsCurrentUserEmailVerified(),
} ) );
jest.mock( 'calypso/state/reader/follows/actions', () => ( {
	requestFollows: jest.fn(),
} ) );
jest.mock( 'calypso/components/notice', () => ( { text }: { text: string } ) => (
	<div data-testid="notice">{ text }</div>
) );

describe( 'AddTumblr', () => {
	beforeEach( () => {
		mockIsCurrentUserEmailVerified.mockReturnValue( true );
	} );

	describe( 'component rendering', () => {
		test( 'renders form, icon and instructions', () => {
			const { container } = render( React.createElement( AddTumblr ) );

			expect( screen.getByTestId( 'add-sites-form' ) ).toBeInTheDocument();
			expect(
				container.querySelector( '.reader-add-tumblr__form.is-disabled' )
			).not.toBeInTheDocument();
			expect( screen.getByTestId( 'tumblr-icon' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Common Tumblr URLs' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Staff Picks:' ) ).toBeInTheDocument();
			expect( screen.getByText( 'A blog:' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Blog tag:' ) ).toBeInTheDocument();
		} );

		test( 'does not show email verification notice when email is verified', () => {
			render( React.createElement( AddTumblr ) );

			expect( screen.queryByTestId( 'notice' ) ).not.toBeInTheDocument();
		} );

		test( 'shows email verification notice when email is not verified', () => {
			mockIsCurrentUserEmailVerified.mockReturnValue( false );

			const { container } = render( React.createElement( AddTumblr ) );

			expect( screen.getByTestId( 'notice' ) ).toBeInTheDocument();
			expect(
				screen.getByText( 'Please verify your email before subscribing.' )
			).toBeInTheDocument();
			expect(
				container.querySelector( '.reader-add-tumblr__form.is-disabled' )
			).toBeInTheDocument();
		} );
	} );
} );
