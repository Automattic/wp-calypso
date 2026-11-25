/**
 * @vitest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type MockedFunction, vi } from 'vitest';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import EmailVerificationNotification from '..';
import type { ReactNode } from 'react';

const mockDispatch = vi.fn( ( action ) => action );
let mockEmailToVerify: string | null = null;
let mockIsEmailChangePending = false;
let mockSecondsUntilResend = 0;
const mockHoldResend = vi.fn();
const mockSendVerificationEmail = vi.fn();

vi.mock( 'i18n-calypso', () =>
	( ( m ) => ( { ...m, default: m } ) )( {
		useTranslate: () => ( text: string, options?: { args?: Record< string, unknown > } ) => {
			if ( options?.args ) {
				return Object.entries( options.args ).reduce(
					( result, [ key, value ] ) => result.replace( `%(${ key })s`, String( value ) ),
					text
				);
			}
			return text;
		},
	} )
);

vi.mock( '@wordpress/components', () => ( {
	Button: ( {
		children,
		disabled,
		href,
		isBusy,
		onClick,
	}: {
		children: ReactNode;
		disabled?: boolean;
		href?: string;
		isBusy?: boolean;
		onClick?: () => void;
	} ) =>
		href ? (
			<a href={ href }>{ children }</a>
		) : (
			<button data-busy={ isBusy } disabled={ disabled } onClick={ onClick }>
				{ children }
			</button>
		),
	VisuallyHidden: ( { children }: { children: ReactNode } ) => <span>{ children }</span>,
} ) );

vi.mock( 'calypso/a8c-for-agencies/components/layout/banner', () => ( {
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

vi.mock( 'calypso/components/email-verification/hooks/use-get-email-to-verify', () => ( {
	__esModule: true,
	default: () => mockEmailToVerify,
} ) );

vi.mock( 'calypso/state/selectors/is-pending-email-change', () => ( {
	__esModule: true,
	default: () => mockIsEmailChangePending,
} ) );

vi.mock( 'calypso/dashboard/account/hooks/use-resend-cooldown', () => ( {
	useResendCooldown: () => ( {
		secondsUntilResend: mockSecondsUntilResend,
		hold: mockHoldResend,
	} ),
} ) );

vi.mock( 'calypso/landing/stepper/hooks/use-send-email-verification', () => ( {
	useSendEmailVerification: () => mockSendVerificationEmail,
} ) );

vi.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );

vi.mock( 'calypso/state/notices/actions', () => ( {
	errorNotice: vi.fn( ( text ) => ( { type: 'ERROR_NOTICE', text } ) ),
	successNotice: vi.fn( ( text ) => ( { type: 'SUCCESS_NOTICE', text } ) ),
} ) );

vi.mock( 'calypso/state/user-settings/actions', () => ( {
	fetchUserSettings: vi.fn( () => ( { type: 'USER_SETTINGS_REQUEST' } ) ),
} ) );

vi.mock( 'calypso/dashboard/utils/email-verification-resend', () => ( {
	formatCooldown: vi.fn( ( seconds: number ) => `${ Math.floor( seconds / 60 ) }:00` ),
	resendAcceptedRetryAfter: vi.fn( () => 300 ),
	resendThrottleRetryAfter: vi.fn( () => null ),
} ) );

const mockedErrorNotice = errorNotice as MockedFunction< typeof errorNotice >;
const mockedSuccessNotice = successNotice as MockedFunction< typeof successNotice >;

describe( 'EmailVerificationNotification', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		mockEmailToVerify = 'user@example.com';
		mockIsEmailChangePending = false;
		mockSecondsUntilResend = 0;
		mockSendVerificationEmail.mockResolvedValue( { success: true, retry_after: 300 } );
	} );

	it( 'fetches user settings on mount so the email-to-verify hook has data to read', () => {
		mockEmailToVerify = null;

		render( <EmailVerificationNotification /> );

		expect( mockDispatch ).toHaveBeenCalledWith( { type: 'USER_SETTINGS_REQUEST' } );
	} );

	it( 'does not render when email is already verified', () => {
		mockEmailToVerify = null;

		const { container } = render( <EmailVerificationNotification /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders with the email address when email is unverified', () => {
		render( <EmailVerificationNotification /> );

		expect( screen.getByRole( 'heading', { name: 'Verify your email address' } ) ).toBeVisible();
		expect( screen.getByText( /user@example\.com/ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Resend email' } ) ).toBeVisible();
	} );

	it( 'links a pending email change to WordPress.com instead of resending it here', () => {
		mockEmailToVerify = 'new@example.com';
		mockIsEmailChangePending = true;

		render( <EmailVerificationNotification /> );

		expect(
			screen.getByRole( 'link', { name: 'Resend email (opens in a new tab)' } )
		).toHaveAttribute( 'href', 'https://wordpress.com/me' );
		expect( screen.queryByRole( 'button', { name: 'Resend email' } ) ).not.toBeInTheDocument();
	} );

	it( 'renders as a warning-level banner', () => {
		render( <EmailVerificationNotification /> );

		expect( screen.getByTestId( 'layout-banner' ) ).toHaveAttribute( 'data-level', 'warning' );
	} );

	it( 'sends a verification email and dispatches a success notice on click', async () => {
		const user = userEvent.setup();
		render( <EmailVerificationNotification /> );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );

		await waitFor( () => {
			expect( mockSendVerificationEmail ).toHaveBeenCalledTimes( 1 );
			expect( mockedSuccessNotice ).toHaveBeenCalledWith(
				expect.stringContaining( 'user@example.com' )
			);
			expect( mockDispatch ).toHaveBeenCalledWith(
				expect.objectContaining( { type: 'SUCCESS_NOTICE' } )
			);
		} );
	} );

	it( 'dispatches an error notice when the send response indicates failure', async () => {
		mockSendVerificationEmail.mockResolvedValue( { success: false } );
		const user = userEvent.setup();
		render( <EmailVerificationNotification /> );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );

		await waitFor( () => {
			expect( mockedErrorNotice ).toHaveBeenCalled();
			expect( mockDispatch ).toHaveBeenCalledWith(
				expect.objectContaining( { type: 'ERROR_NOTICE' } )
			);
		} );
	} );

	it( 'disables the resend button and shows a countdown during the cooldown period', () => {
		mockSecondsUntilResend = 240;

		render( <EmailVerificationNotification /> );

		const button = screen.getByRole( 'button' );
		expect( button ).toBeDisabled();
		expect( button ).toHaveTextContent( /Resend email \(/ );
	} );

	it( 'holds the cooldown after a successful resend', async () => {
		const user = userEvent.setup();
		render( <EmailVerificationNotification /> );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );

		await waitFor( () => {
			expect( mockHoldResend ).toHaveBeenCalledWith( 300 );
		} );
	} );

	it( 'holds the cooldown on a throttled error', async () => {
		const { resendThrottleRetryAfter } = jest.requireMock(
			'calypso/dashboard/utils/email-verification-resend'
		);
		resendThrottleRetryAfter.mockReturnValue( 600 );
		mockSendVerificationEmail.mockRejectedValue( {
			error: 'throttled',
			data: { retry_after: 600 },
		} );

		const user = userEvent.setup();
		render( <EmailVerificationNotification /> );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );

		await waitFor( () => {
			expect( mockHoldResend ).toHaveBeenCalledWith( 600 );
			expect( mockedErrorNotice ).toHaveBeenCalled();
		} );
	} );
} );
