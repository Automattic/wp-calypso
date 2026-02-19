import { calculateAddonCapacityFromLicenses, calculateEffectiveCapacity } from '../capacity';
import type { License } from 'calypso/state/partner-portal/types';

function buildLicense( overrides: Partial< License > = {} ): License {
	return {
		licenseId: 1,
		licenseKey: 'pressable-addon-sites-1',
		productId: 1,
		product: 'pressable-addon-sites-1',
		userId: null,
		username: null,
		blogId: null,
		siteUrl: null,
		hasDownloads: false,
		issuedAt: '',
		attachedAt: null,
		revokedAt: null,
		ownerType: null,
		quantity: 1,
		parentLicenseId: null,
		meta: {},
		referral: null,
		...overrides,
	};
}

describe( 'Pressable usage capacity calculations', () => {
	it( 'keeps base capacities when there are no add-ons', () => {
		expect( calculateEffectiveCapacity( { install: 5, storage: 35, visits: 75000 }, [] ) ).toEqual(
			{ install: 5, storage: 35, visits: 75000 }
		);
	} );

	it( 'adds sites add-on capacity', () => {
		const licenses = [
			buildLicense( {
				licenseKey: 'pressable-addon-sites-5_J64c5S2kkNg0laJlaimU5PKpr',
				quantity: 1,
			} ),
		];

		expect( calculateAddonCapacityFromLicenses( licenses ) ).toEqual( {
			install: 5,
			storage: 20,
			visits: 50000,
		} );
	} );

	it( 'adds storage add-on capacity', () => {
		const licenses = [
			buildLicense( {
				licenseKey: 'pressable-addon-storage-1gb_67tEGzNf2l8Nl001fGg8w9alr',
				quantity: 1,
			} ),
		];

		expect( calculateAddonCapacityFromLicenses( licenses ) ).toEqual( {
			install: 0,
			storage: 1,
			visits: 0,
		} );
	} );

	it( 'adds visits add-on capacity', () => {
		const licenses = [
			buildLicense( { licenseKey: 'pressable-addon-visits-10k_MOCKSUFFIX', quantity: 1 } ),
		];

		expect( calculateAddonCapacityFromLicenses( licenses ) ).toEqual( {
			install: 0,
			storage: 0,
			visits: 10000,
		} );
	} );

	it( 'sums mixed add-ons', () => {
		const licenses = [
			buildLicense( { licenseKey: 'pressable-addon-sites-1_SFX1', quantity: 1 } ),
			buildLicense( { licenseKey: 'pressable-addon-storage-1gb_SFX2', quantity: 2 } ),
			buildLicense( { licenseKey: 'pressable-addon-visits-10k_SFX3', quantity: 3 } ),
		];

		expect( calculateAddonCapacityFromLicenses( licenses ) ).toEqual( {
			install: 1,
			storage: 12,
			visits: 40000,
		} );
	} );

	it( 'multiplies by quantity and defaults null quantity to 1', () => {
		const licenses = [
			buildLicense( { licenseKey: 'pressable-addon-sites-10', quantity: 2 } ),
			buildLicense( { licenseKey: 'pressable-addon-storage-1gb', quantity: null } ),
		];

		expect( calculateAddonCapacityFromLicenses( licenses ) ).toEqual( {
			install: 20,
			storage: 41,
			visits: 200000,
		} );
	} );

	it( 'ignores unknown, revoked, referral, and non-add-on licenses', () => {
		const licenses = [
			buildLicense( { licenseKey: 'pressable-signature-3' } ),
			buildLicense( { licenseKey: 'unknown-addon-key' } ),
			buildLicense( { licenseKey: 'pressable-addon-sites-1', revokedAt: '2026-01-01T00:00:00Z' } ),
			buildLicense( {
				licenseKey: 'pressable-addon-visits-10k',
				referral: { id: 1 } as License[ 'referral' ],
			} ),
		];

		expect( calculateAddonCapacityFromLicenses( licenses ) ).toEqual( {
			install: 0,
			storage: 0,
			visits: 0,
		} );
	} );
} );
