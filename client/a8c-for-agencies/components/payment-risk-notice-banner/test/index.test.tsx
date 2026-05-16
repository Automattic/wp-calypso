/**
 * @jest-environment jsdom
 */

import { isEnabled } from '@automattic/calypso-config';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import PaymentRiskNoticeBanner from '..';
import type { ReactNode } from 'react';

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
	}: {
		children: ReactNode;
		href?: string;
		onClick?: () => void;
	} ) => (
		<button data-href={ href } onClick={ onClick }>
			{ children }
		</button>
	),
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

const mockDispatch = jest.fn();

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
			screen.getByRole( 'heading', { name: 'Payment issue needs attention' } )
		).toBeVisible();
		expect(
			screen.getByText(
				'Your agency has a payment issue. Update your payment method to avoid service interruption.'
			)
		).toBeVisible();

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_payment_risk_notice_banner_view',
			{ source: 'overview' }
		);

		await user.click( screen.getByRole( 'button', { name: 'Update payment method' } ) );

		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_payment_risk_notice_banner_cta_click',
			{ source: 'overview' }
		);
	} );
} );
