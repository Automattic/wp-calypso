import { getInitialReferralLogo, getReferralLogoOption, getReferralLogoPayload } from '../logo';

describe( 'getInitialReferralLogo', () => {
	it( 'opens on the profile logo, then the last referral logo, then nothing', () => {
		expect( getInitialReferralLogo( 'https://a/profile.png', 'https://a/last.png' ) ).toEqual( {
			type: 'profile',
			url: 'https://a/profile.png',
		} );
		expect( getInitialReferralLogo( null, 'https://a/last.png' ) ).toEqual( {
			type: 'last',
			url: 'https://a/last.png',
		} );
		expect( getInitialReferralLogo( '', undefined ) ).toEqual( { type: 'none' } );
	} );
} );

describe( 'getReferralLogoPayload', () => {
	it( 'sends the profile logo by type and a chosen logo by URL', () => {
		expect( getReferralLogoPayload( { type: 'profile', url: 'https://a/p.png' } ) ).toEqual( {
			type: 'profile',
		} );
		expect( getReferralLogoPayload( { type: 'last', url: 'https://a/last.png' } ) ).toEqual( {
			type: 'custom',
			url: 'https://a/last.png',
		} );
		expect( getReferralLogoPayload( { type: 'none' } ) ).toEqual( { type: 'none' } );
	} );

	it( 'sends an uploaded file by its stored URL, and nothing when the upload gave none', () => {
		const file = new File( [ 'x' ], 'logo.png', { type: 'image/png' } );
		const picked = { type: 'file' as const, file, previewUrl: 'blob:preview' };
		expect( getReferralLogoPayload( picked, 'https://a/uploaded.png' ) ).toEqual( {
			type: 'custom',
			url: 'https://a/uploaded.png',
		} );
		expect( getReferralLogoPayload( picked ) ).toEqual( { type: 'none' } );
	} );
} );

describe( 'getReferralLogoOption', () => {
	it( 'reports the choice in the classic vocabulary', () => {
		expect( getReferralLogoOption( { type: 'profile', url: 'u' } ) ).toBe( 'profile' );
		expect( getReferralLogoOption( { type: 'last', url: 'u' } ) ).toBe( 'different' );
		expect( getReferralLogoOption( { type: 'none' } ) ).toBe( 'none' );
	} );
} );
