/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SolutionsCardsUpsellStep from '../solutions-cards-upsell-step';
import type { SiteDetails } from '@automattic/data-stores';
import type { Purchase } from 'calypso/lib/purchases/types';

const mockSetNewMessagingChat = jest.fn();
const mockSetNavigateToRoute = jest.fn();
const mockSetShowHelpCenter = jest.fn();
const mockSetOpenOdieWithContext = jest.fn();

jest.mock( '@wordpress/data', () => {
	const noop = () => ( {} );
	const identity = ( fn: unknown ) => fn;
	return {
		useDispatch: () => ( {
			setNewMessagingChat: mockSetNewMessagingChat,
			setNavigateToRoute: mockSetNavigateToRoute,
			setShowHelpCenter: mockSetShowHelpCenter,
			setOpenOdieWithContext: mockSetOpenOdieWithContext,
		} ),
		useSelect: ( selector: ( s: unknown ) => unknown ) => selector( () => undefined ),
		combineReducers: ( reducers: Record< string, unknown > ) => reducers,
		createSelector: identity,
		createReduxStore: noop,
		createRegistrySelector: identity,
		register: noop,
		registerStore: noop,
		use: noop,
		plugins: { persistence: noop },
		dispatch: () => ( {} ),
		select: () => ( {} ),
		subscribe: () => () => {},
	};
} );

let mockCanConnectToZendesk = true;

jest.mock( '@automattic/zendesk-client', () => ( {
	useCanConnectToZendeskMessaging: () => ( { data: mockCanConnectToZendesk } ),
} ) );

jest.mock( 'i18n-calypso', () => {
	const passthrough = ( s: string ) => s;
	return {
		useTranslate: () => passthrough,
		translate: passthrough,
		localize: ( Component: React.ComponentType ) => Component,
	};
} );

jest.mock( 'calypso/components/formatted-header', () => {
	return function MockFormattedHeader( { headerText }: { headerText: string } ) {
		return <h2>{ headerText }</h2>;
	};
} );

const purchase = {
	id: 123,
	productSlug: 'business-bundle',
	currencyCode: 'USD',
} as Purchase;

const site = {
	ID: 456,
	slug: 'example.wordpress.com',
	URL: 'https://example.wordpress.com',
} as SiteDetails;

describe( '<SolutionsCardsUpsellStep /> (legacy)', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockCanConnectToZendesk = true;
	} );

	test( 'speak-with-support calls setNewMessagingChat when Zendesk eligible', async () => {
		const user = userEvent.setup();
		const closeDialog = jest.fn();

		render(
			<SolutionsCardsUpsellStep
				cancellationReason="noLongerNeedSite"
				purchase={ purchase }
				site={ site }
				closeDialog={ closeDialog }
				onDeclineUpsell={ jest.fn() }
			/>
		);

		const supportCard = screen.getByRole( 'button', {
			name: /Speak with our support team/,
		} );
		await user.click( supportCard );

		expect( mockSetNewMessagingChat ).toHaveBeenCalledTimes( 1 );
		expect( mockSetNewMessagingChat ).toHaveBeenCalledWith(
			expect.objectContaining( {
				siteUrl: 'https://example.wordpress.com',
				siteId: '456',
			} )
		);
		expect( mockSetNavigateToRoute ).not.toHaveBeenCalledWith( '/odie' );
		expect( closeDialog ).not.toHaveBeenCalled();
	} );

	test( 'speak-with-support opens Odie fallback when not Zendesk eligible', async () => {
		mockCanConnectToZendesk = false;
		const user = userEvent.setup();
		const closeDialog = jest.fn();

		render(
			<SolutionsCardsUpsellStep
				cancellationReason="noLongerNeedSite"
				purchase={ purchase }
				site={ site }
				closeDialog={ closeDialog }
				onDeclineUpsell={ jest.fn() }
			/>
		);

		const supportCard = screen.getByRole( 'button', {
			name: /Speak with our support team/,
		} );
		await user.click( supportCard );

		expect( mockSetOpenOdieWithContext ).toHaveBeenCalledTimes( 1 );
		expect( mockSetOpenOdieWithContext ).toHaveBeenCalledWith(
			expect.objectContaining( {
				initialMessage: expect.stringContaining( 'Cancellation reason' ),
				siteUrl: 'https://example.wordpress.com',
				siteId: '456',
			} )
		);
		expect( mockSetNewMessagingChat ).not.toHaveBeenCalled();
		expect( closeDialog ).not.toHaveBeenCalled();
	} );
} );
