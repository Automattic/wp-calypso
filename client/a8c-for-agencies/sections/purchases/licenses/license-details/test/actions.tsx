/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { LicenseState, LicenseType } from 'calypso/jetpack-cloud/sections/partner-portal/types';
import a8cForAgencies from 'calypso/state/a8c-for-agencies/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import LicenseDetailsActions from '../actions';

jest.mock( '../../revoke-license-dialog/hooks/use-license-download-url-mutation', () => ( {
	__esModule: true,
	default: () => ( { mutate: jest.fn(), status: 'idle', error: null, data: null } ),
} ) );

const initialState = {
	a8cForAgencies: {
		agencies: {
			activeAgency: {
				id: 1,
				user: { role: 'a4a_administrator', capabilities: [ 'a4a_revoke_licenses' ] },
			},
			isAgencyClientUser: false,
		},
	},
};

function renderActions(
	licenseKey: string,
	product: string,
	licenseState: LicenseState = LicenseState.Detached
) {
	return renderWithProvider(
		<LicenseDetailsActions
			licenseKey={ licenseKey }
			product={ product }
			siteUrl={ null }
			licenseState={ licenseState }
			licenseType={ LicenseType.Partner }
			hasDownloads={ false }
		/>,
		{ initialState, reducers: { a8cForAgencies } }
	);
}

describe( 'LicenseDetailsActions', () => {
	it( 'hides Revoke for a Titan license but keeps Manage in Pressable', () => {
		renderActions(
			'pressable-addon-titan-inbox-monthly_xyz',
			'pressable-addon-titan-inbox-monthly'
		);

		expect( screen.getByRole( 'link', { name: /Manage in Pressable/ } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Revoke' } ) ).not.toBeInTheDocument();
	} );

	it( 'keeps Revoke for other Pressable addons', () => {
		renderActions( 'pressable-addon-sites-1_abc', 'pressable-addon-sites-1' );

		expect( screen.getByRole( 'button', { name: 'Revoke' } ) ).toBeVisible();
	} );

	it( 'links a Pressable plan license to its usage in Pressable', () => {
		renderActions( 'pressable-signature-2_abc', 'pressable-signature-2', LicenseState.Attached );

		expect(
			screen.getByRole( 'link', { name: /View plan usage details in Pressable/ } )
		).toHaveAttribute( 'href', 'https://my.pressable.com/usage' );
	} );

	it( 'does not link a Pressable addon to plan usage', () => {
		renderActions(
			'pressable-addon-sites-1_abc',
			'pressable-addon-sites-1',
			LicenseState.Attached
		);

		expect(
			screen.queryByRole( 'link', { name: /View plan usage details in Pressable/ } )
		).not.toBeInTheDocument();
	} );
} );
