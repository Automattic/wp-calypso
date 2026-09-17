/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import PurchaseConfirmationMessage from '../purchase-confirmation-message';
import type { ReactNode } from 'react';

const mockDispatch = jest.fn();

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( 'calypso/a8c-for-agencies/components/layout/banner', () => ( {
	__esModule: true,
	default: ( {
		children,
		level,
		onClose,
		title,
	}: {
		children: ReactNode;
		level: string;
		onClose: () => void;
		title: string;
	} ) => (
		<section data-level={ level }>
			<h2>{ title }</h2>
			{ children }
			<button onClick={ onClose }>Close</button>
		</section>
	),
} ) );

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( ( name, properties ) => ( {
		type: 'RECORD_TRACKS_EVENT',
		name,
		properties,
	} ) ),
} ) );

const mockedPage = page as jest.MockedFunction< typeof page >;
const mockedRecordTracksEvent = recordTracksEvent as jest.MockedFunction<
	typeof recordTracksEvent
>;

describe( 'PurchaseConfirmationMessage', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		window.history.replaceState( {}, '', '/client/subscriptions' );
	} );

	it( 'does not render on a direct subscriptions visit', () => {
		const { container } = render( <PurchaseConfirmationMessage /> );

		expect( container ).toBeEmptyDOMElement();
		expect( mockedPage ).not.toHaveBeenCalled();
	} );

	it( 'shows and consumes the generic client purchase confirmation', async () => {
		window.history.replaceState(
			{},
			'',
			'/client/subscriptions?client_purchase_completed=true&source=checkout'
		);

		render( <PurchaseConfirmationMessage /> );

		expect(
			await screen.findByRole( 'heading', { name: 'Congratulations on your purchase!' } )
		).toBeVisible();
		expect(
			screen.getByText(
				'We’ve let your agency know, and they’ll begin setting things up for you. There’s nothing else you need to do right now.'
			)
		).toBeVisible();
		expect( mockedPage ).toHaveBeenCalledWith( '/client/subscriptions?source=checkout' );
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_client_purchase_confirmation_view'
		);
	} );

	it( 'keeps the WordPress.com hosting-specific confirmation', async () => {
		window.history.replaceState(
			{},
			'',
			'/client/subscriptions?client_purchase_completed=true&wpcom_plan_purchased=wpcom-business'
		);

		const { rerender } = render( <PurchaseConfirmationMessage /> );

		expect(
			await screen.findByRole( 'heading', {
				name: 'You’ve successfully purchased a WordPress.com site!',
			} )
		).toBeVisible();
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_client_wpcom_hosting_purchased',
			{ hosting_plan: 'wpcom-business' }
		);
		expect( mockedPage ).toHaveBeenCalledWith( '/client/subscriptions' );

		window.history.replaceState( {}, '', '/client/subscriptions' );
		rerender( <PurchaseConfirmationMessage /> );

		expect(
			screen.getByRole( 'heading', {
				name: 'You’ve successfully purchased a WordPress.com site!',
			} )
		).toBeVisible();
	} );

	it( 'can be dismissed', async () => {
		const user = userEvent.setup();
		window.history.replaceState( {}, '', '/client/subscriptions?client_purchase_completed=true' );

		render( <PurchaseConfirmationMessage /> );

		await user.click(
			await screen.findByRole( 'button', {
				name: 'Close',
			} )
		);

		await waitFor( () => {
			expect(
				screen.queryByRole( 'heading', { name: 'Congratulations on your purchase!' } )
			).not.toBeInTheDocument();
		} );
	} );
} );
