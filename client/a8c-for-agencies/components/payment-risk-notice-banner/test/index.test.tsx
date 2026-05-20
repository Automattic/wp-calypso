/**
 * @jest-environment jsdom
 */

import { isEnabled } from '@automattic/calypso-config';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import PaymentRiskNoticeBanner from '..';
import type { ReactNode } from 'react';

const mockSetShowHelpCenter = jest.fn();
const mockSetNavigateToRoute = jest.fn();
const mockDispatch = jest.fn();

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

jest.mock( '@automattic/data-stores', () => ( {
	HelpCenter: {
		register: jest.fn( () => 'help-center-store' ),
	},
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		setShowHelpCenter: mockSetShowHelpCenter,
		setNavigateToRoute: mockSetNavigateToRoute,
	} ),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		children,
		href,
		onClick,
		rel,
		target,
	}: {
		children: ReactNode;
		href?: string;
		onClick?: ( event: { preventDefault: () => void } ) => void;
		rel?: string;
		target?: string;
	} ) => (
		<button
			data-href={ href }
			data-rel={ rel }
			data-target={ target }
			onClick={ () => onClick?.( { preventDefault: jest.fn() } ) }
		>
			{ children }
		</button>
	),
} ) );

jest.mock( 'calypso/a8c-for-agencies/components/a4a-contact-support-widget', () => ( {
	CONTACT_URL_HASH_FRAGMENT: '#contact-support',
} ) );

jest.mock( 'calypso/a8c-for-agencies/components/layout/banner', () => ( {
	__esModule: true,
	default: ( {
		actions,
		children,
		title,
	}: {
		actions?: ReactNode[];
		children: ReactNode;
		title?: string;
	} ) => (
		<section>
			{ title && <h2>{ title }</h2> }
			{ children }
			{ actions }
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

const mockedIsEnabled = isEnabled as jest.MockedFunction< typeof isEnabled >;
const mockedRecordTracksEvent = recordTracksEvent as jest.MockedFunction<
	typeof recordTracksEvent
>;

describe( 'PaymentRiskNoticeBanner', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockedIsEnabled.mockImplementation( ( flag ) => flag === 'a4a-payment-risk-notice-banner' );
	} );

	it( 'does not render when the feature flag is disabled', () => {
		mockedIsEnabled.mockReturnValue( false );

		const { container } = render( <PaymentRiskNoticeBanner source="overview" /> );

		expect( container ).toBeEmptyDOMElement();
		expect( mockDispatch ).not.toHaveBeenCalled();
	} );

	it( 'renders the notice and records view and CTA click events', async () => {
		const user = userEvent.setup();

		render( <PaymentRiskNoticeBanner source="overview" /> );

		expect(
			screen.getByRole( 'heading', {
				name: 'Action required: We’re unable to renew your subscription(s)',
			} )
		).toBeVisible();
		expect(
			screen.getByText(
				'We couldn’t process payment for one or more of your subscriptions with the payment method we have on file. If this isn’t resolved, your subscriptions will be cancelled and your sites may go offline. Please update your payment method to stay covered.'
			)
		).toBeVisible();

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_payment_risk_notice_banner_view',
			{ source: 'overview' }
		);

		const fixPaymentMethodButton = screen.getByRole( 'button', { name: 'Fix payment method' } );

		expect( fixPaymentMethodButton ).toHaveAttribute( 'data-target', '_blank' );
		expect( fixPaymentMethodButton ).toHaveAttribute( 'data-rel', 'noopener noreferrer' );

		await user.click( fixPaymentMethodButton );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_payment_risk_notice_banner_cta_click',
			{ source: 'overview' }
		);

		await user.click( screen.getByRole( 'button', { name: 'Contact us' } ) );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_payment_risk_notice_banner_contact_us_click',
			{ source: 'overview' }
		);
		expect( mockSetShowHelpCenter ).toHaveBeenCalledWith( true );
		expect( mockSetNavigateToRoute ).toHaveBeenCalledWith( '/contact-form' );
	} );
} );
