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

const mockDispatch = jest.fn();
let mockPaymentNotice: PaymentNotice | null = null;

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
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
			primary_action_label: 'Update your payment method',
			primary_action_url: 'https://wordpress.com/me/billing/purchases',
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
			primary_action_label: 'Update your payment method',
			primary_action_url: 'https://wordpress.com/me/billing/purchases',
			secondary_action_label: 'View billing FAQ',
			secondary_action_url:
				'https://agencieshelp.automattic.com/knowledge-base/add-or-update-a-payment-method/',
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

		const updatePaymentMethodButton = screen.getByRole( 'button', {
			name: 'Update your payment method',
		} );

		expect( updatePaymentMethodButton ).toHaveAttribute(
			'data-href',
			'https://wordpress.com/me/billing/purchases'
		);
		expect( updatePaymentMethodButton ).toHaveAttribute( 'data-target', '_blank' );
		expect( updatePaymentMethodButton ).toHaveAttribute( 'data-rel', 'noopener noreferrer' );

		await user.click( updatePaymentMethodButton );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_payment_risk_notice_banner_cta_click',
			{ action: 'primary', source: 'overview', state: 'card_expiry', severity: 'warning' }
		);

		const viewBillingFaqButton = screen.getByRole( 'button', { name: 'View billing FAQ' } );

		expect( viewBillingFaqButton ).toHaveAttribute(
			'data-href',
			'https://agencieshelp.automattic.com/knowledge-base/add-or-update-a-payment-method/'
		);
		expect( viewBillingFaqButton ).toHaveAttribute( 'data-target', '_blank' );
		expect( viewBillingFaqButton ).toHaveAttribute( 'data-rel', 'noopener noreferrer' );

		await user.click( viewBillingFaqButton );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_payment_risk_notice_banner_cta_click',
			{ action: 'secondary', source: 'overview', state: 'card_expiry', severity: 'warning' }
		);
	} );

	it( 'renders a referral notice with only the client instructions CTA', () => {
		mockPaymentNotice = {
			state: 'renewal_failure',
			severity: 'error',
			title: 'Action required: Client payment failed',
			content:
				'We couldn’t process payment for Jane Doe’s Pressable plan. Please ask them to update their payment method.',
			primary_action_label: 'Send your client update instructions',
			primary_action_url:
				'https://agencieshelp.automattic.com/knowledge-base/update-the-payment-method-for-your-referral-purchase/',
			can_current_user_manage_payment_method: false,
		};

		render( <PaymentRiskNoticeBanner source="purchases_billing" /> );

		expect(
			screen.getByRole( 'button', { name: 'Send your client update instructions' } )
		).toHaveAttribute(
			'data-href',
			'https://agencieshelp.automattic.com/knowledge-base/update-the-payment-method-for-your-referral-purchase/'
		);
		expect(
			screen.queryByRole( 'button', { name: 'Fix payment method' } )
		).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Contact us' } ) ).not.toBeInTheDocument();
	} );

	it( 'does not render a fallback CTA for users who cannot manage payment methods', () => {
		mockPaymentNotice = {
			state: 'renewal_failure',
			severity: 'error',
			title: 'Action required: Client payment failed',
			content:
				'We couldn’t process payment for Jane Doe’s Pressable plan. Please ask them to update their payment method.',
			can_current_user_manage_payment_method: false,
		};

		render( <PaymentRiskNoticeBanner source="purchases_billing" /> );

		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );
} );
