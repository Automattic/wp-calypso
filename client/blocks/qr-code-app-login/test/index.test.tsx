/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { act, render, screen } from '@testing-library/react';
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

type ApproveError = { code?: string; message?: string };

interface CapturingApprove {
	mock: ApproveReturn;
	triggerError: ( error: ApproveError ) => void;
	mutate: jest.Mock;
}

const buildCapturingApprove = (): CapturingApprove => {
	let captured: { onError?: ( e: ApproveError ) => void } = {};
	const mutate = jest.fn( ( _args, options ) => {
		captured = options ?? {};
	} );
	return {
		mock: { mutate, isPending: false } as unknown as ApproveReturn,
		triggerError: ( error ) => {
			act( () => captured.onError?.( error ) );
		},
		mutate,
	};
};

const tokenData = { token: 't', encrypted: 'e', expires: 9_999_999_999 };

const tokenIssued = () =>
	( {
		...idleCreateToken(),
		data: tokenData,
	} ) as unknown as CreateTokenReturn;

const scannedStatus = () =>
	( {
		data: { status: 'scanned', numbers: [ 3, 7, 11 ], device: 'Pixel 7' },
		isError: false,
	} ) as unknown as StatusReturn;

const renderWithGenerateClicked = async () => {
	render( <QRCodeAppLogin /> );
	await userEvent.click( screen.getByRole( 'button', { name: 'Generate code' } ) );
};

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
		mockedUseCreateToken.mockReturnValue( tokenIssued() );
		mockedUseCountdown.mockReturnValue( { remainingMs: 0, totalMs: 120_000, hasExpired: true } );

		await renderWithGenerateClicked();

		expect(
			screen.getByText( /sign-in attempt has expired/, {
				selector: '.components-notice__content',
			} )
		).toBeVisible();
	} );

	it( 'keeps Sign-in complete when the local countdown expires after consumed', async () => {
		mockedUseCreateToken.mockReturnValue( tokenIssued() );
		mockedUseStatus.mockReturnValue( {
			data: { status: 'consumed' },
			isError: false,
		} as unknown as StatusReturn );
		mockedUseCountdown.mockReturnValue( { remainingMs: 0, totalMs: 120_000, hasExpired: true } );

		await renderWithGenerateClicked();

		expect( screen.getByText( 'Sign-in complete.' ) ).toBeVisible();
		expect(
			screen.queryByText( /sign-in attempt has expired/, {
				selector: '.components-notice__content',
			} )
		).not.toBeInTheDocument();
	} );

	it( 'keeps the approved state when the local countdown expires after approval', async () => {
		mockedUseCreateToken.mockReturnValue( tokenIssued() );
		mockedUseStatus.mockReturnValue( {
			data: { status: 'approved' },
			isError: false,
		} as unknown as StatusReturn );
		mockedUseCountdown.mockReturnValue( { remainingMs: 0, totalMs: 120_000, hasExpired: true } );

		await renderWithGenerateClicked();

		expect( screen.getByText( /waiting for the app to finish signing in/ ) ).toBeVisible();
		expect(
			screen.queryByText( /sign-in attempt has expired/, {
				selector: '.components-notice__content',
			} )
		).not.toBeInTheDocument();
	} );

	describe( 'approve error branches', () => {
		it( 'flips to rejected on a wrong_number error', async () => {
			mockedUseCreateToken.mockReturnValue( tokenIssued() );
			mockedUseStatus.mockReturnValue( scannedStatus() );
			const approve = buildCapturingApprove();
			mockedUseApprove.mockReturnValue( approve.mock );

			await renderWithGenerateClicked();
			await userEvent.click( screen.getByRole( 'button', { name: /tapping 7/ } ) );

			approve.triggerError( { code: 'wrong_number' } );

			expect(
				screen.getByText( /Login was rejected/, { selector: '.components-notice__content' } )
			).toBeVisible();
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_qr_app_login_wrong_number' );
		} );

		it( 'flips to expired on a token_expired error', async () => {
			mockedUseCreateToken.mockReturnValue( tokenIssued() );
			mockedUseStatus.mockReturnValue( scannedStatus() );
			const approve = buildCapturingApprove();
			mockedUseApprove.mockReturnValue( approve.mock );

			await renderWithGenerateClicked();
			await userEvent.click( screen.getByRole( 'button', { name: /tapping 3/ } ) );

			approve.triggerError( { code: 'token_expired' } );

			expect(
				screen.getByText( /sign-in attempt has expired/, {
					selector: '.components-notice__content',
				} )
			).toBeVisible();
		} );

		it( 'shows an inline retry Notice on a generic error and keeps the buttons', async () => {
			mockedUseCreateToken.mockReturnValue( tokenIssued() );
			mockedUseStatus.mockReturnValue( scannedStatus() );
			const approve = buildCapturingApprove();
			mockedUseApprove.mockReturnValue( approve.mock );

			await renderWithGenerateClicked();
			await userEvent.click( screen.getByRole( 'button', { name: /tapping 11/ } ) );

			approve.triggerError( { code: 'something_unexpected' } );

			expect(
				screen.getByText( /Could not confirm sign-in/, {
					selector: '.components-notice__content',
				} )
			).toBeVisible();
			// Number buttons remain so the user can retry.
			expect( screen.getByRole( 'button', { name: /tapping 3/ } ) ).toBeEnabled();
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_qr_app_login_approve_error', {
				error_code: 'something_unexpected',
			} );
		} );
	} );

	describe( 'Start over', () => {
		it( 'returns to the intent screen from a terminal state', async () => {
			mockedUseCreateToken.mockReturnValue( tokenIssued() );
			mockedUseStatus.mockReturnValue( {
				data: { status: 'rejected' },
				isError: false,
			} as unknown as StatusReturn );

			await renderWithGenerateClicked();

			await userEvent.click( screen.getByRole( 'button', { name: 'Start over' } ) );

			expect( screen.getByRole( 'button', { name: 'Generate code' } ) ).toBeVisible();
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_qr_app_login_start_over' );
		} );
	} );

	describe( 'tracks events', () => {
		it( 'fires page_view on mount', () => {
			render( <QRCodeAppLogin /> );

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_qr_app_login_page_view' );
		} );

		it( 'fires token_created when a token arrives', async () => {
			mockedUseCreateToken.mockReturnValue( tokenIssued() );

			await renderWithGenerateClicked();

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_qr_app_login_token_created' );
		} );

		it( 'fires token_failed when token creation errors', async () => {
			mockedUseCreateToken.mockReturnValue( {
				...idleCreateToken(),
				isError: true,
			} as unknown as CreateTokenReturn );

			await renderWithGenerateClicked();

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_qr_app_login_token_failed' );
		} );

		it.each( [ 'scanned', 'approved', 'consumed', 'rejected', 'expired' ] as const )(
			'fires the matching event when status becomes %s',
			async ( status ) => {
				mockedUseCreateToken.mockReturnValue( tokenIssued() );
				mockedUseStatus.mockReturnValue( {
					data: { status, numbers: [ 1, 2, 3 ], device: 'Pixel 7' },
					isError: false,
				} as unknown as StatusReturn );

				await renderWithGenerateClicked();

				expect( recordTracksEvent ).toHaveBeenCalledWith( `calypso_qr_app_login_${ status }` );
			}
		);

		it( 'fires expired on local countdown exhaustion (no server status yet)', async () => {
			mockedUseCreateToken.mockReturnValue( tokenIssued() );
			mockedUseCountdown.mockReturnValue( {
				remainingMs: 0,
				totalMs: 120_000,
				hasExpired: true,
			} );

			await renderWithGenerateClicked();

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_qr_app_login_expired' );
		} );

		it( 'does not fire expired when local countdown exhausts after consumed', async () => {
			mockedUseCreateToken.mockReturnValue( tokenIssued() );
			mockedUseStatus.mockReturnValue( {
				data: { status: 'consumed' },
				isError: false,
			} as unknown as StatusReturn );
			mockedUseCountdown.mockReturnValue( {
				remainingMs: 0,
				totalMs: 120_000,
				hasExpired: true,
			} );

			await renderWithGenerateClicked();

			expect( recordTracksEvent ).not.toHaveBeenCalledWith( 'calypso_qr_app_login_expired' );
		} );

		it( 'fires approve_clicked on number tap', async () => {
			mockedUseCreateToken.mockReturnValue( tokenIssued() );
			mockedUseStatus.mockReturnValue( scannedStatus() );

			await renderWithGenerateClicked();
			await userEvent.click( screen.getByRole( 'button', { name: /tapping 7/ } ) );

			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_qr_app_login_approve_clicked' );
		} );
	} );
} );
