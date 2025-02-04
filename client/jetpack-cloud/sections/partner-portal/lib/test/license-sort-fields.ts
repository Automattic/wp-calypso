import { LicenseSortField } from '../../types';
import {
	publicToInternalLicenseSortField,
	internalToPublicLicenseSortField,
} from '../license-sort-fields';

const ALL_SORT_FIELD_MAPPINGS = [
	{
		publicField: LicenseSortField.IssuedAt,
		internalField: LicenseSortField.IssuedAt,
	},
	{
		publicField: 'assigned_on',
		internalField: LicenseSortField.AttachedAt,
	},
	{
		publicField: LicenseSortField.RevokedAt,
		internalField: LicenseSortField.RevokedAt,
	},
];

describe( 'publicToInternalLicenseSortField', () => {
	it.each( ALL_SORT_FIELD_MAPPINGS )(
		'returns $internalField when given "$publicField"',
		( { internalField, publicField } ) => {
			const result = publicToInternalLicenseSortField( publicField, '' as LicenseSortField );
			expect( result ).toBe( internalField );
		}
	);

	it( 'returns a fallback option when the given public field has no internal counterpart', () => {
		const result1 = publicToInternalLicenseSortField( 'whatever', LicenseSortField.AttachedAt );
		expect( result1 ).toBe( LicenseSortField.AttachedAt );

		const result2 = publicToInternalLicenseSortField( 'randomstring', LicenseSortField.RevokedAt );
		expect( result2 ).toBe( LicenseSortField.RevokedAt );
	} );
} );

describe( 'internalToPublicLicenseSortField', () => {
	it.each( ALL_SORT_FIELD_MAPPINGS )(
		'returns "$publicField" when given $internalField',
		( { internalField, publicField } ) => {
			const result = internalToPublicLicenseSortField( internalField );
			expect( result ).toBe( publicField );
		}
	);
} );
