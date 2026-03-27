/**
 * @jest-environment jsdom
 */

import { SiteSubscriptionsQueryPropsProvider } from '@automattic/data-stores/src/reader/contexts';
import { act, screen } from '@testing-library/react';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import AddSubscriptionForm from '../index';

// Capture AddSitesForm callbacks so tests can trigger them directly.
let capturedOnChangeFeedPreview: ( hasPreview: boolean ) => void;
let capturedOnChangeSubscribe: () => void;

jest.mock( 'calypso/landing/subscriptions/components/add-sites-form', () => ( {
	AddSitesForm: jest.fn(
		( { onChangeFeedPreview, onChangeSubscribe }: Record< string, () => void > ) => {
			capturedOnChangeFeedPreview = onChangeFeedPreview;
			capturedOnChangeSubscribe = onChangeSubscribe;
			return <div data-testid="add-sites-form" />;
		}
	),
} ) );

jest.mock( 'calypso/landing/subscriptions/components/site-subscriptions-list', () => ( {
	SiteSubscriptionsList: jest.fn( () => <div data-testid="site-subscriptions-list" /> ),
} ) );

jest.mock( 'calypso/reader/site-subscriptions-manager/unsubscribed-feeds-search-list', () => ( {
	UnsubscribedFeedsSearchList: jest.fn( () => (
		<div data-testid="unsubscribed-feeds-search-list" />
	) ),
} ) );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	isCurrentUserEmailVerified: jest.fn(),
} ) );

const mockIsCurrentUserEmailVerified = jest.mocked( isCurrentUserEmailVerified );

const mockRequestFollows = jest.fn( () => ( { type: 'REQUEST_FOLLOWS' } ) );
jest.mock( 'calypso/state/reader/follows/actions', () => ( {
	requestFollows: () => mockRequestFollows(),
} ) );

describe( 'AddSubscriptionForm', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsCurrentUserEmailVerified.mockReturnValue( true );
	} );

	describe( 'email verification notice', () => {
		it( 'shows a warning when the user email is not verified', () => {
			mockIsCurrentUserEmailVerified.mockReturnValue( false );
			const { container } = renderWithProvider( <AddSubscriptionForm type="add-new" /> );

			expect(
				screen.getByText( 'Please verify your email before subscribing.' )
			).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Account Settings' } ) ).toHaveAttribute(
				'href',
				'/me/account'
			);
			expect(
				container.querySelector( '.reader-add-subscription__form.is-disabled' )
			).toBeInTheDocument();
		} );

		it( 'does not show a warning when the user email is verified', () => {
			const { container } = renderWithProvider( <AddSubscriptionForm type="add-new" /> );

			expect(
				screen.queryByText( 'Please verify your email before subscribing.' )
			).not.toBeInTheDocument();
			expect(
				container.querySelector( '.reader-add-subscription__form.is-disabled' )
			).not.toBeInTheDocument();
		} );
	} );

	describe( 'add-new tab', () => {
		it( 'shows the subscriptions list when there are no instructions', () => {
			const { SiteSubscriptionsList } = jest.requireMock(
				'calypso/landing/subscriptions/components/site-subscriptions-list'
			);

			renderWithProvider( <AddSubscriptionForm type="add-new" /> );

			expect( screen.getByText( 'Your subscriptions' ) ).toBeVisible();
			expect( screen.getByTestId( 'site-subscriptions-list' ) ).toBeInTheDocument();
			expect( SiteSubscriptionsList ).toHaveBeenCalledWith(
				expect.objectContaining( { layout: 'compact' } ),
				expect.anything()
			);
		} );

		it( 'shows the related sites list when there is a search term', () => {
			renderWithProvider(
				<SiteSubscriptionsQueryPropsProvider initialSearchTermState="example">
					<AddSubscriptionForm type="add-new" />
				</SiteSubscriptionsQueryPropsProvider>
			);
			expect( screen.getByTestId( 'unsubscribed-feeds-search-list' ) ).toBeInTheDocument();
		} );

		it( 'does not show the related sites list when there is no search term', () => {
			renderWithProvider(
				<SiteSubscriptionsQueryPropsProvider initialSearchTermState="">
					<AddSubscriptionForm type="add-new" />
				</SiteSubscriptionsQueryPropsProvider>
			);
			expect( screen.queryByTestId( 'unsubscribed-feeds-search-list' ) ).not.toBeInTheDocument();
		} );

		it( 'does not dispatch requestFollows on subscribe toggle', () => {
			renderWithProvider( <AddSubscriptionForm type="add-new" /> );

			act( () => capturedOnChangeSubscribe() );

			expect( mockRequestFollows ).not.toHaveBeenCalled();
		} );

		it( 'hides the subscriptions list when a feed preview becomes active', () => {
			renderWithProvider( <AddSubscriptionForm type="add-new" /> );

			expect( screen.getByTestId( 'site-subscriptions-list' ) ).toBeInTheDocument();

			act( () => capturedOnChangeFeedPreview( true ) );
			expect( screen.queryByText( 'Your subscriptions' ) ).not.toBeInTheDocument();

			expect( screen.queryByTestId( 'site-subscriptions-list' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'platform specific tabs', () => {
		it( 'shows instructions when the config provides them', () => {
			renderWithProvider( <AddSubscriptionForm type="reddit" /> );

			expect( screen.queryByTestId( 'site-subscriptions-list' ) ).not.toBeInTheDocument();
			expect( screen.getByLabelText( 'Reddit Icon' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'heading', { name: 'Common Reddit URLs' } ) ).toBeInTheDocument();
			expect( screen.getByText( 'Front page:' ) ).toBeInTheDocument();
			expect( screen.getByText( 'www.reddit.com/.rss' ) ).toBeInTheDocument();
		} );

		it( 'dispatches requestFollows on subscribe toggle', () => {
			renderWithProvider( <AddSubscriptionForm type="reddit" /> );

			act( () => capturedOnChangeSubscribe() );

			expect( mockRequestFollows ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'hides instructions when a feed preview becomes active', () => {
			renderWithProvider( <AddSubscriptionForm type="reddit" /> );

			expect( screen.getByRole( 'heading', { name: 'Common Reddit URLs' } ) ).toBeInTheDocument();

			act( () => capturedOnChangeFeedPreview( true ) );

			expect( screen.queryByTestId( 'instructions-icon' ) ).not.toBeInTheDocument();
			expect(
				screen.queryByRole( 'heading', { name: 'Common Reddit URLs' } )
			).not.toBeInTheDocument();
		} );

		it( 'closes the feed preview when the subscription is toggled', () => {
			renderWithProvider( <AddSubscriptionForm type="reddit" /> );

			act( () => capturedOnChangeFeedPreview( true ) );

			// Instructions are hidden while feed preview is open.
			expect(
				screen.queryByRole( 'heading', { name: 'Common Reddit URLs' } )
			).not.toBeInTheDocument();

			act( () => capturedOnChangeSubscribe() );

			// Instructions are restored after subscribe toggle closes the preview.
			expect( screen.getByRole( 'heading', { name: 'Common Reddit URLs' } ) ).toBeInTheDocument();
		} );
	} );
} );
