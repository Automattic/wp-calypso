import { LicenseFilter } from '../../types';
import { publicToInternalLicenseFilter, internalToPublicLicenseFilter } from '../license-filters';

const ALL_FILTER_MAPPINGS = [
	{
		publicFilter: 'assigned',
		internalFilter: LicenseFilter.Attached,
	},
	{
		publicFilter: 'unassigned',
		internalFilter: LicenseFilter.Detached,
	},
	{
		publicFilter: LicenseFilter.NotRevoked,
		internalFilter: LicenseFilter.NotRevoked,
	},
	{
		publicFilter: LicenseFilter.Standard,
		internalFilter: LicenseFilter.Standard,
	},
	{
		publicFilter: LicenseFilter.Revoked,
		internalFilter: LicenseFilter.Revoked,
	},
];

describe( 'publicToInternalLicenseFilter', () => {
	it.each( ALL_FILTER_MAPPINGS )(
		'returns $internalFilter when given "$publicFilter"',
		( { publicFilter, internalFilter } ) => {
			const result = publicToInternalLicenseFilter( publicFilter, '' as LicenseFilter );
			expect( result ).toBe( internalFilter );
		}
	);

	it( 'returns a fallback option when the given public filter has no internal counterpart', () => {
		const result1 = publicToInternalLicenseFilter( 'whatever', LicenseFilter.NotRevoked );
		expect( result1 ).toBe( LicenseFilter.NotRevoked );

		const result2 = publicToInternalLicenseFilter( 'randomstring', LicenseFilter.Detached );
		expect( result2 ).toBe( LicenseFilter.Detached );
	} );
} );

describe( 'internalToPublicLicenseFilter', () => {
	it.each( ALL_FILTER_MAPPINGS )(
		'returns "$publicFilter" when given $internalFilter',
		( { publicFilter, internalFilter } ) => {
			const result = internalToPublicLicenseFilter( internalFilter );
			expect( result ).toBe( publicFilter );
		}
	);
} );
