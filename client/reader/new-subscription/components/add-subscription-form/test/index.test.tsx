/**
 * @jest-environment jsdom
 */

import { getSiteSubscriptionsQueryKey } from '@automattic/api-queries';
import { SiteSubscriptionsQueryPropsProvider } from '@automattic/data-stores/src/reader/contexts';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import AddSubscriptionForm from '../index';

interface AddSitesFormMockProps {
	onChangeFeedPreview: ( hasPreview: boolean ) => void;
	onChangeSubscribe: () => void;
}

jest.mock( 'calypso/landing/subscriptions/components/add-sites-form', () => ( {
	AddSitesForm: jest.fn( ( { onChangeFeedPreview, onChangeSubscribe }: AddSitesFormMockProps ) => {
		return (
			<div>
				<button type="button" onClick={ () => onChangeFeedPreview( true ) }>
					Show feed preview
				</button>
				<button type="button" onClick={ onChangeSubscribe }>
					Toggle subscription
				</button>
			</div>
		);
	} ),
} ) );

jest.mock( 'calypso/landing/subscriptions/components/site-subscriptions-list', () => ( {
	SiteSubscriptionsList: jest.fn( () => <section aria-label="Site subscriptions list" /> ),
} ) );

jest.mock( 'calypso/reader/site-subscriptions-manager/unsubscribed-feeds-search-list', () => ( {
	UnsubscribedFeedsSearchList: jest.fn( () => <section aria-label="Related sites list" /> ),
} ) );

jest.mock( 'calypso/state/current-user/selectors', () => ( {
	isCurrentUserEmailVerified: jest.fn(),
} ) );

const mockIsCurrentUserEmailVerified = jest.mocked( isCurrentUserEmailVerified );

describe( 'AddSubscriptionForm', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsCurrentUserEmailVerified.mockReturnValue( true );
	} );

	describe( 'email verification notice', () => {
		it( 'shows a warning when the user email is not verified', () => {
			mockIsCurrentUserEmailVerified.mockReturnValue( false );
			renderWithProvider( <AddSubscriptionForm type="add-new" /> );

			expect(
				screen.getByText( 'Please verify your email before subscribing.' )
			).toBeInTheDocument();
			expect( screen.getByRole( 'link', { name: 'Account Settings' } ) ).toHaveAttribute(
				'href',
				'/me/account'
			);
		} );

		it( 'does not show a warning when the user email is verified', () => {
			renderWithProvider( <AddSubscriptionForm type="add-new" /> );

			expect(
				screen.queryByText( 'Please verify your email before subscribing.' )
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
			expect(
				screen.getByRole( 'region', { name: 'Site subscriptions list' } )
			).toBeInTheDocument();
			// Only assert on the props argument: React 18 calls function components
			// with `( props, {} )` while React 19 passes `( props, undefined )`.
			expect( SiteSubscriptionsList.mock.calls[ 0 ][ 0 ] ).toEqual(
				expect.objectContaining( { layout: 'compact' } )
			);
		} );

		it( 'shows the related sites list when there is a search term', () => {
			renderWithProvider(
				<SiteSubscriptionsQueryPropsProvider initialSearchTermState="example">
					<AddSubscriptionForm type="add-new" />
				</SiteSubscriptionsQueryPropsProvider>
			);
			expect( screen.getByRole( 'region', { name: 'Related sites list' } ) ).toBeInTheDocument();
		} );

		it( 'does not show the related sites list when there is no search term', () => {
			renderWithProvider(
				<SiteSubscriptionsQueryPropsProvider initialSearchTermState="">
					<AddSubscriptionForm type="add-new" />
				</SiteSubscriptionsQueryPropsProvider>
			);
			expect(
				screen.queryByRole( 'region', { name: 'Related sites list' } )
			).not.toBeInTheDocument();
		} );

		it( 'does not invalidate follows on subscribe toggle', async () => {
			const user = userEvent.setup();
			const queryClient = new QueryClient();
			const invalidateQueries = jest.spyOn( queryClient, 'invalidateQueries' );
			renderWithProvider( <AddSubscriptionForm type="add-new" />, { queryClient } );

			await user.click( screen.getByRole( 'button', { name: 'Toggle subscription' } ) );

			expect( invalidateQueries ).not.toHaveBeenCalledWith( {
				queryKey: getSiteSubscriptionsQueryKey(),
			} );
		} );

		it( 'hides the subscriptions list when a feed preview becomes active', async () => {
			const user = userEvent.setup();
			renderWithProvider( <AddSubscriptionForm type="add-new" /> );

			expect(
				screen.getByRole( 'region', { name: 'Site subscriptions list' } )
			).toBeInTheDocument();

			await user.click( screen.getByRole( 'button', { name: 'Show feed preview' } ) );
			expect( screen.queryByText( 'Your subscriptions' ) ).not.toBeInTheDocument();

			expect(
				screen.queryByRole( 'region', { name: 'Site subscriptions list' } )
			).not.toBeInTheDocument();
		} );
	} );

	describe( 'platform specific tabs', () => {
		it( 'shows instructions when the config provides them', () => {
			renderWithProvider( <AddSubscriptionForm type="reddit" /> );

			expect(
				screen.queryByRole( 'region', { name: 'Site subscriptions list' } )
			).not.toBeInTheDocument();
			expect( screen.getByLabelText( 'Reddit Icon' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'heading', { name: 'Common Reddit URLs' } ) ).toBeInTheDocument();
			expect( screen.getByText( 'Front page:' ) ).toBeInTheDocument();
			expect( screen.getByText( 'www.reddit.com/.rss' ) ).toBeInTheDocument();
		} );

		it( 'invalidates follows on subscribe toggle', async () => {
			const user = userEvent.setup();
			const queryClient = new QueryClient();
			const invalidateQueries = jest.spyOn( queryClient, 'invalidateQueries' );
			renderWithProvider( <AddSubscriptionForm type="reddit" />, { queryClient } );

			await user.click( screen.getByRole( 'button', { name: 'Toggle subscription' } ) );

			expect( invalidateQueries ).toHaveBeenCalledWith( {
				queryKey: getSiteSubscriptionsQueryKey(),
			} );
		} );

		it( 'hides instructions when a feed preview becomes active', async () => {
			const user = userEvent.setup();
			renderWithProvider( <AddSubscriptionForm type="reddit" /> );

			expect( screen.getByRole( 'heading', { name: 'Common Reddit URLs' } ) ).toBeInTheDocument();

			await user.click( screen.getByRole( 'button', { name: 'Show feed preview' } ) );

			expect( screen.queryByTestId( 'instructions-icon' ) ).not.toBeInTheDocument();
			expect(
				screen.queryByRole( 'heading', { name: 'Common Reddit URLs' } )
			).not.toBeInTheDocument();
		} );

		it( 'closes the feed preview when the subscription is toggled', async () => {
			const user = userEvent.setup();
			renderWithProvider( <AddSubscriptionForm type="reddit" /> );

			await user.click( screen.getByRole( 'button', { name: 'Show feed preview' } ) );

			// Instructions are hidden while feed preview is open.
			expect(
				screen.queryByRole( 'heading', { name: 'Common Reddit URLs' } )
			).not.toBeInTheDocument();

			await user.click( screen.getByRole( 'button', { name: 'Toggle subscription' } ) );

			// Instructions are restored after subscribe toggle closes the preview.
			expect( screen.getByRole( 'heading', { name: 'Common Reddit URLs' } ) ).toBeInTheDocument();
		} );
	} );
} );
