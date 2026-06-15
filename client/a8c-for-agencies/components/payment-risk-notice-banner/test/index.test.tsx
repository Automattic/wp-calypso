/**
 * @jest-environment jsdom
 */

import { isEnabled } from '@automattic/calypso-config';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import PaymentRiskNoticeBanner from '..';
import type { PaymentNotice } from 'calypso/state/a8c-for-agencies/types';
import type { ReactNode } from 'react';

const mockSetShowHelpCenter = jest.fn();
const mockSetNavigateToRoute = jest.fn();
const mockDispatch = jest.fn();
let mockPaymentNotice: PaymentNotice | null = null;

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
		level,
		title,
	}: {
		actions?: ReactNode[];
		children: ReactNode;
		level: string;
		title?: string;
	} ) => (
		<section data-level={ level } data-testid="layout-banner">
			{ title && <h2>{ title }</h2> }
			{ children }
			{ actions }
		</section>
	),
} ) );

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: ( selector: ( state: unknown ) => unknown ) =>
		selector( {
			a8cForAgencies: {
				agencies: {
					activeAgency: {
						payment_notice: mockPaymentNotice,
					},
				},
			},
		} ),
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
		mockPaymentNotice = {
			state: 'renewal_failure',
			severity: 'error',
			title: 'Action required: We are unable to renew your subscription(s)',
			content:
				'We could not process payment for one or more of your subscriptions with the payment method we have on file.',
		};
		mockedIsEnabled.mockImplementation( ( flag ) => flag === 'a4a-payment-risk-notice-banner' );
	} );

	it( 'does not render when the feature flag is disabled', () => {
		mockedIsEnabled.mockReturnValue( false );

		const { container } = render( <PaymentRiskNoticeBanner source="overview" /> );

		expect( container ).toBeEmptyDOMElement();
		expect( mockDispatch ).not.toHaveBeenCalled();
	} );

	it( 'does not render when the payment notice is missing', () => {
		mockPaymentNotice = null;

		const { container } = render( <PaymentRiskNoticeBanner source="overview" /> );

		expect( container ).toBeEmptyDOMElement();
		expect( mockDispatch ).not.toHaveBeenCalled();
	} );

	it( 'does not record another view event when the same notice is refetched', () => {
		const getViewEventCalls = () =>
			mockedRecordTracksEvent.mock.calls.filter(
				( [ eventName ] ) => eventName === 'calypso_a4a_payment_risk_notice_banner_view'
			);

		const { rerender } = render( <PaymentRiskNoticeBanner source="overview" /> );

		expect( getViewEventCalls() ).toHaveLength( 1 );

		mockPaymentNotice = { ...mockPaymentNotice! };
		rerender( <PaymentRiskNoticeBanner source="overview" /> );

		expect( getViewEventCalls() ).toHaveLength( 1 );
	} );

	it( 'renders the API notice and records view and CTA click events', async () => {
		const user = userEvent.setup();
		mockPaymentNotice = {
			state: 'card_expiry',
			severity: 'warning',
			title: 'Action required: Update your payment method',
			content:
				'The payment method we have on file is expiring soon. Please update it to avoid interruption to your subscriptions and sites.',
		};

		render( <PaymentRiskNoticeBanner source="overview" /> );

		expect(
			screen.getByRole( 'heading', {
				name: 'Action required: Update your payment method',
			} )
		).toBeVisible();
		expect(
			screen.getByText(
				'The payment method we have on file is expiring soon. Please update it to avoid interruption to your subscriptions and sites.'
			)
		).toBeVisible();
		expect( screen.getByTestId( 'layout-banner' ) ).toHaveAttribute( 'data-level', 'warning' );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_payment_risk_notice_banner_view',
			{ source: 'overview', state: 'card_expiry', severity: 'warning' }
		);

		const fixPaymentMethodButton = screen.getByRole( 'button', { name: 'Fix payment method' } );

		expect( fixPaymentMethodButton ).toHaveAttribute( 'data-target', '_blank' );
		expect( fixPaymentMethodButton ).toHaveAttribute( 'data-rel', 'noopener noreferrer' );

		await user.click( fixPaymentMethodButton );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_payment_risk_notice_banner_cta_click',
			{ source: 'overview', state: 'card_expiry', severity: 'warning' }
		);

		await user.click( screen.getByRole( 'button', { name: 'Contact us' } ) );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_payment_risk_notice_banner_contact_us_click',
			{ source: 'overview', state: 'card_expiry', severity: 'warning' }
		);
		expect( mockSetShowHelpCenter ).toHaveBeenCalledWith( true );
		expect( mockSetNavigateToRoute ).toHaveBeenCalledWith( '/contact-form' );
	} );
} );
