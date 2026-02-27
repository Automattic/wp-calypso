/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SubscriptionType } from '../components/add-subscription-form/consts';
import ReaderNewSubscriptionPage from '../index';

jest.mock(
	'../components/add-subscription-form',
	() =>
		function AddSubscriptionForm( { type }: { type: SubscriptionType } ) {
			return <div data-testid="add-subscription" data-subscription-type={ type } />;
		}
);

jest.mock(
	'../../components/reader-main',
	() =>
		function ReaderMain( { children }: { children: React.ReactNode } ) {
			return <div>{ children }</div>;
		}
);

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock(
	'calypso/components/navigation-header',
	() =>
		function NavigationHeader( { title, subtitle }: { title: string; subtitle: string } ) {
			return (
				<div>
					<h1>{ title }</h1>
					<p>{ subtitle }</p>
				</div>
			);
		}
);

jest.mock(
	'calypso/components/section-nav',
	() =>
		function SectionNav( { children }: { children: React.ReactNode } ) {
			return <nav>{ children }</nav>;
		}
);

jest.mock(
	'calypso/components/section-nav/tabs',
	() =>
		function NavTabs( { children }: { children: React.ReactNode } ) {
			return <ul>{ children }</ul>;
		}
);

jest.mock(
	'calypso/components/section-nav/item',
	() =>
		function NavItem( {
			children,
			selected,
			onClick,
		}: {
			children: React.ReactNode;
			selected: boolean;
			onClick: () => void;
		} ) {
			return (
				// eslint-disable-next-line jsx-a11y/click-events-have-key-events
				<li aria-current={ selected } role="menuitem" onClick={ onClick }>
					{ children }
				</li>
			);
		}
);

jest.mock( 'calypso/reader/stats', () => ( {
	recordAction: jest.fn(),
	recordGaEvent: jest.fn(),
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: jest.fn( () => ( { type: 'MOCK_TRACKS_EVENT' } ) ),
} ) );

describe( 'ReaderNewSubscriptionPage', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders all tabs', () => {
		renderWithProvider( <ReaderNewSubscriptionPage selectedTab="add-new" /> );

		expect( screen.getByRole( 'heading', { name: 'New Subscription' } ) ).toBeVisible();
		expect(
			screen.getByText( 'Subscribe to new blogs, newsletters, and RSS feeds.' )
		).toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: 'Add new' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Reddit' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'YouTube' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Tumblr' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Substack' } ) ).toBeVisible();
	} );

	it( 'marks the selected tab as current', () => {
		renderWithProvider( <ReaderNewSubscriptionPage selectedTab="reddit" /> );

		expect( screen.getByRole( 'menuitem', { name: 'Reddit' } ) ).toHaveAttribute(
			'aria-current',
			'true'
		);
		expect( screen.getByRole( 'menuitem', { name: 'Add new' } ) ).toHaveAttribute(
			'aria-current',
			'false'
		);
	} );

	it( 'renders AddSubscriptionForm for the selected tab', () => {
		renderWithProvider( <ReaderNewSubscriptionPage selectedTab="youtube" /> );

		expect( screen.getByTestId( 'add-subscription' ) ).toHaveAttribute(
			'data-subscription-type',
			'youtube'
		);
	} );

	it( 'records analytics when a tab is clicked', async () => {
		renderWithProvider( <ReaderNewSubscriptionPage selectedTab="add-new" /> );

		await userEvent.click( screen.getByRole( 'menuitem', { name: 'Reddit' } ) );

		expect( recordAction ).toHaveBeenCalledWith( 'click_new_subscription_tab' );
		expect( recordGaEvent ).toHaveBeenCalledWith( 'Clicked New Subscription Tab' );
		expect( recordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_new_subscription_tab_clicked',
			{ tab_slug: 'reddit' }
		);
	} );
} );
