/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import EmailVerificationNotification from '..';
import type { ReactNode } from 'react';

const mockDispatch = jest.fn( ( action ) => action );
let mockEmailToVerify: string | null = null;
let mockIsEmailChangePending = false;
let mockSecondsUntilResend = 0;
const mockHoldResend = jest.fn();
const mockSendVerificationEmail = jest.fn();

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string, options?: { args?: Record< string, unknown > } ) => {
		if ( options?.args ) {
			return Object.entries( options.args ).reduce(
				( result, [ key, value ] ) => result.replace( `%(${ key })s`, String( value ) ),
				text
			);
		}
		return text;
	},
} ) );

jest.mock( '@wordpress/components', () => ( {
	Button: ( {
		children,
		disabled,
		isBusy,
		onClick,
	}: {
		children: ReactNode;
		disabled?: boolean;
		isBusy?: boolean;
		onClick?: () => void;
	} ) => (
		<button data-busy={ isBusy } disabled={ disabled } onClick={ onClick }>
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

jest.mock( 'calypso/components/email-verification/hooks/use-get-email-to-verify', () => ( {
	__esModule: true,
	default: () => mockEmailToVerify,
} ) );

jest.mock( 'calypso/state/selectors/is-pending-email-change', () => ( {
	__esModule: true,
	default: () => mockIsEmailChangePending,
} ) );

jest.mock( 'calypso/dashboard/utils/use-resend-cooldown', () => ( {
	useResendCooldown: () => ( {
		secondsUntilResend: mockSecondsUntilResend,
		hold: mockHoldResend,
	} ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-send-email-verification', () => ( {
	useSendEmailVerification: () => mockSendVerificationEmail,
} ) );

jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );

jest.mock( 'calypso/state/notices/actions', () => ( {
	errorNotice: jest.fn( ( text ) => ( { type: 'ERROR_NOTICE', text } ) ),
	successNotice: jest.fn( ( text ) => ( { type: 'SUCCESS_NOTICE', text } ) ),
} ) );

jest.mock( 'calypso/state/user-settings/actions', () => ( {
	setUnsavedUserSetting: jest.fn( ( key, value ) => ( {
		type: 'SET_UNSAVED_USER_SETTING',
		key,
		value,
	} ) ),
} ) );

jest.mock( 'calypso/state/user-settings/thunks', () => ( {
	saveUnsavedUserSettings: jest.fn( () => ( { type: 'SAVE_UNSAVED_USER_SETTINGS' } ) ),
} ) );

jest.mock( 'calypso/dashboard/utils/email-verification-resend', () => ( {
	formatCooldown: jest.fn( ( seconds: number ) => `${ Math.floor( seconds / 60 ) }:00` ),
	resendAcceptedRetryAfter: jest.fn( () => 300 ),
	resendThrottleRetryAfter: jest.fn( () => null ),
} ) );

const mockedErrorNotice = errorNotice as jest.MockedFunction< typeof errorNotice >;
const mockedSuccessNotice = successNotice as jest.MockedFunction< typeof successNotice >;

describe( 'EmailVerificationNotification', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockEmailToVerify = 'user@example.com';
		mockIsEmailChangePending = false;
		mockSecondsUntilResend = 0;
		mockSendVerificationEmail.mockResolvedValue( { success: true, retry_after: 300 } );
	} );

	it( 'does not render when email is already verified', () => {
		mockEmailToVerify = null;

		const { container } = render( <EmailVerificationNotification /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders with the email address when email is unverified', () => {
		render( <EmailVerificationNotification /> );

		expect(
			screen.getByRole( 'heading', { name: 'Verify your email address' } )
		).toBeVisible();
		expect( screen.getByText( /user@example\.com/ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Resend email' } ) ).toBeVisible();
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
		mockSendVerificationEmail.mockRejectedValue( { error: 'throttled', data: { retry_after: 600 } } );

		const user = userEvent.setup();
		render( <EmailVerificationNotification /> );

		await user.click( screen.getByRole( 'button', { name: 'Resend email' } ) );

		await waitFor( () => {
			expect( mockHoldResend ).toHaveBeenCalledWith( 600 );
			expect( mockedErrorNotice ).toHaveBeenCalled();
		} );
	} );
} );
