/**
 * @jest-environment jsdom
 */

import MobileDownloadCardTest from 'calypso/blocks/get-apps/mobile-download-card';
import { isIos, isAndroid } from 'calypso/lib/user-agent';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';

jest.mock( 'calypso/lib/user-agent', () => ( {
	isIos: jest.fn(),
	isAndroid: jest.fn(),
} ) );

jest.mock(
	'calypso/blocks/app-promo/qr-code',
	() => () =>
		'Visit wp.com/app from your mobile device, or scan the code to download the Jetpack mobile app.'
);

describe( 'MobileDownloadCardTest', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders linked image for mobile iOS device', () => {
		( isAndroid as jest.Mock ).mockReturnValue( false );
		( isIos as jest.Mock ).mockReturnValue( true );

		const { getByRole, queryByText } = renderWithProvider( <MobileDownloadCardTest /> );

		expect( getByRole( 'link' ) ).toHaveAttribute(
			'href',
			'https://apps.apple.com/app/apple-store/id1565481562?pt=299112&ct=calypso-get-apps-button&mt=8'
		);
		expect( queryByText( /scan the code to download/ ) ).toBeNull();
	} );

	it( 'renders linked image for mobile Android device', () => {
		( isAndroid as jest.Mock ).mockReturnValue( true );
		( isIos as jest.Mock ).mockReturnValue( false );

		const { getByRole, queryByText } = renderWithProvider( <MobileDownloadCardTest /> );

		expect( getByRole( 'link' ) ).toHaveAttribute(
			'href',
			'https://play.google.com/store/apps/details?id=com.jetpack.android&referrer=utm_source%3D%calypso%26utm_medium%3Dweb%26utm_campaign%3Dcalypso-get-apps'
		);
		expect( queryByText( /scan the code to download/ ) ).toBeNull();
	} );

	it( 'renders qr code for devices other than iOS or Android', async () => {
		( isAndroid as jest.Mock ).mockReturnValue( false );
		( isIos as jest.Mock ).mockReturnValue( false );

		const { getByText } = renderWithProvider( <MobileDownloadCardTest /> );

		expect( getByText( /scan the code to download/ ) ).toBeVisible();
	} );
} );
