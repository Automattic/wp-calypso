/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QRCodeAppLogin from '../index';
import { useApprove } from '../use-approve';
import { useCountdown } from '../use-countdown';
import { useCreateToken } from '../use-create-token';
import { useDocumentVisible } from '../use-document-visible';
import { useStatus } from '../use-status';

jest.mock( '../use-create-token' );
jest.mock( '../use-status' );
jest.mock( '../use-approve' );
jest.mock( '../use-document-visible' );
jest.mock( '../use-countdown' );
jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

// qrcode.react renders an <svg>; not relevant to these tests.
jest.mock( '../qr-code', () => ( {
	__esModule: true,
	default: () => <div data-testid="qr-code" />,
	QRCodePlaceholder: () => <div data-testid="qr-code-placeholder" />,
} ) );

const mockedUseCreateToken = jest.mocked( useCreateToken );
const mockedUseStatus = jest.mocked( useStatus );
const mockedUseApprove = jest.mocked( useApprove );
const mockedUseDocumentVisible = jest.mocked( useDocumentVisible );
const mockedUseCountdown = jest.mocked( useCountdown );

type CreateTokenReturn = ReturnType< typeof useCreateToken >;
type StatusReturn = ReturnType< typeof useStatus >;
type ApproveReturn = ReturnType< typeof useApprove >;

const idleCreateToken = (): CreateTokenReturn =>
	( {
		mutate: jest.fn(),
		data: undefined,
		isPending: false,
		isError: false,
		reset: jest.fn(),
	} ) as unknown as CreateTokenReturn;

const idleStatus = (): StatusReturn =>
	( { data: undefined, isError: false } ) as unknown as StatusReturn;

const idleApprove = (): ApproveReturn =>
	( { mutate: jest.fn(), isPending: false } ) as unknown as ApproveReturn;

beforeEach( () => {
	jest.clearAllMocks();
	mockedUseCreateToken.mockReturnValue( idleCreateToken() );
	mockedUseStatus.mockReturnValue( idleStatus() );
	mockedUseApprove.mockReturnValue( idleApprove() );
	mockedUseDocumentVisible.mockReturnValue( true );
	mockedUseCountdown.mockReturnValue( null );
} );

describe( 'QRCodeAppLogin', () => {
	it( 'renders the intent screen by default and does not request a token', () => {
		const mutate = jest.fn();
		mockedUseCreateToken.mockReturnValue( {
			...idleCreateToken(),
			mutate,
		} as unknown as CreateTokenReturn );

		render( <QRCodeAppLogin /> );

		expect( screen.getByRole( 'button', { name: 'Generate code' } ) ).toBeVisible();
		expect( mutate ).not.toHaveBeenCalled();
	} );

	it( 'requests a token only after the user clicks Generate code', async () => {
		const mutate = jest.fn();
		mockedUseCreateToken.mockReturnValue( {
			...idleCreateToken(),
			mutate,
		} as unknown as CreateTokenReturn );

		render( <QRCodeAppLogin /> );

		await userEvent.click( screen.getByRole( 'button', { name: 'Generate code' } ) );

		expect( mutate ).toHaveBeenCalledTimes( 1 );
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_qr_app_login_generate_clicked' );
	} );

	it( 'renders the QR + steps once a token has been issued', async () => {
		mockedUseCreateToken.mockReturnValue( {
			...idleCreateToken(),
			data: { token: 't', encrypted: 'e', expires: 9_999_999_999 },
		} as unknown as CreateTokenReturn );

		render( <QRCodeAppLogin /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Generate code' } ) );

		expect( screen.getByTestId( 'qr-code' ) ).toBeVisible();
		expect( screen.getByText( /Open the WooCommerce app/ ) ).toBeVisible();
	} );

	it( 'renders the token-error state with a primary Start over', async () => {
		mockedUseCreateToken.mockReturnValue( {
			...idleCreateToken(),
			isError: true,
		} as unknown as CreateTokenReturn );

		render( <QRCodeAppLogin /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Generate code' } ) );

		expect(
			screen.getByText( /Could not generate a sign-in code/, {
				selector: '.components-notice__content',
			} )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Start over' } ) ).toBeVisible();
	} );

	it( 'renders the scanned state with device name and number buttons', async () => {
		mockedUseCreateToken.mockReturnValue( {
			...idleCreateToken(),
			data: { token: 't', encrypted: 'e', expires: 9_999_999_999 },
		} as unknown as CreateTokenReturn );
		mockedUseStatus.mockReturnValue( {
			data: { status: 'scanned', numbers: [ 3, 7, 11 ], device: 'Pixel 7' },
			isError: false,
		} as unknown as StatusReturn );

		render( <QRCodeAppLogin /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Generate code' } ) );

		expect( screen.getByText( /Confirm sign-in on Pixel 7/ ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /tapping 3/ } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /tapping 7/ } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /tapping 11/ } ) ).toBeVisible();
	} );

	it( 'calls approve when a number-match button is tapped', async () => {
		const mutate = jest.fn();
		mockedUseCreateToken.mockReturnValue( {
			...idleCreateToken(),
			data: { token: 't', encrypted: 'e', expires: 9_999_999_999 },
		} as unknown as CreateTokenReturn );
		mockedUseStatus.mockReturnValue( {
			data: { status: 'scanned', numbers: [ 3, 7, 11 ], device: 'Pixel 7' },
			isError: false,
		} as unknown as StatusReturn );
		mockedUseApprove.mockReturnValue( { mutate, isPending: false } as unknown as ApproveReturn );

		render( <QRCodeAppLogin /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Generate code' } ) );
		await userEvent.click( screen.getByRole( 'button', { name: /tapping 7/ } ) );

		expect( mutate ).toHaveBeenCalledWith(
			expect.objectContaining( { token: 't', chosenNumber: 7 } ),
			expect.any( Object )
		);
	} );

	it( 'renders the approved state', async () => {
		mockedUseCreateToken.mockReturnValue( {
			...idleCreateToken(),
			data: { token: 't', encrypted: 'e', expires: 9_999_999_999 },
		} as unknown as CreateTokenReturn );
		mockedUseStatus.mockReturnValue( {
			data: { status: 'approved' },
			isError: false,
		} as unknown as StatusReturn );

		render( <QRCodeAppLogin /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Generate code' } ) );

		expect( screen.getByText( /waiting for the app to finish signing in/ ) ).toBeVisible();
	} );

	it( 'renders the consumed state', async () => {
		mockedUseCreateToken.mockReturnValue( {
			...idleCreateToken(),
			data: { token: 't', encrypted: 'e', expires: 9_999_999_999 },
		} as unknown as CreateTokenReturn );
		mockedUseStatus.mockReturnValue( {
			data: { status: 'consumed' },
			isError: false,
		} as unknown as StatusReturn );

		render( <QRCodeAppLogin /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Generate code' } ) );

		expect( screen.getByText( 'Sign-in complete.' ) ).toBeVisible();
	} );

	it( 'renders the rejected state', async () => {
		mockedUseCreateToken.mockReturnValue( {
			...idleCreateToken(),
			data: { token: 't', encrypted: 'e', expires: 9_999_999_999 },
		} as unknown as CreateTokenReturn );
		mockedUseStatus.mockReturnValue( {
			data: { status: 'rejected' },
			isError: false,
		} as unknown as StatusReturn );

		render( <QRCodeAppLogin /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Generate code' } ) );

		expect(
			screen.getByText( /Login was rejected/, { selector: '.components-notice__content' } )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Start over' } ) ).toBeVisible();
	} );

	it( 'renders the expired state when the server says expired', async () => {
		mockedUseCreateToken.mockReturnValue( {
			...idleCreateToken(),
			data: { token: 't', encrypted: 'e', expires: 9_999_999_999 },
		} as unknown as CreateTokenReturn );
		mockedUseStatus.mockReturnValue( {
			data: { status: 'expired' },
			isError: false,
		} as unknown as StatusReturn );

		render( <QRCodeAppLogin /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Generate code' } ) );

		expect(
			screen.getByText( /sign-in attempt has expired/, {
				selector: '.components-notice__content',
			} )
		).toBeVisible();
	} );

	it( 'renders the expired state when the local countdown runs out', async () => {
		mockedUseCreateToken.mockReturnValue( {
			...idleCreateToken(),
			data: { token: 't', encrypted: 'e', expires: 9_999_999_999 },
		} as unknown as CreateTokenReturn );
		mockedUseCountdown.mockReturnValue( { remainingMs: 0, totalMs: 120_000, hasExpired: true } );

		render( <QRCodeAppLogin /> );
		await userEvent.click( screen.getByRole( 'button', { name: 'Generate code' } ) );

		expect(
			screen.getByText( /sign-in attempt has expired/, {
				selector: '.components-notice__content',
			} )
		).toBeVisible();
	} );
} );
