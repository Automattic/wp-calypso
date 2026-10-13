import { isListedProductOnSale, isProductOnSale } from '../is-product-on-sale';
import type { AppState } from 'calypso/types';

// Response subsets from the JETPACK-2825 client contract fixtures.
const pro = ( available: unknown ) => ( {
	jetpack_pro_monthly: { available: false },
	jetpack_pro_yearly: { available },
	jetpack_pro_bi_yearly: { available },
} );

const onSale = ( productsList: Record< string, unknown > | undefined ) =>
	[ 'jetpack_pro_monthly', 'jetpack_pro_yearly', 'jetpack_pro_bi_yearly' ].filter( ( slug ) =>
		isListedProductOnSale( productsList as Parameters< typeof isListedProductOnSale >[ 0 ], slug )
	);

describe( 'isListedProductOnSale', () => {
	it( 'offers nothing while Pro is off sale or rolled back', () => {
		expect( onSale( pro( false ) ) ).toEqual( [] );
	} );

	it( 'offers yearly and two-year, never monthly, once Pro is on sale', () => {
		expect( onSale( pro( true ) ) ).toEqual( [ 'jetpack_pro_yearly', 'jetpack_pro_bi_yearly' ] );
	} );

	it.each( [
		[ 'missing products', {} ],
		[ 'a failed or unloaded list', undefined ],
		[ 'missing availability', { jetpack_pro_yearly: {}, jetpack_pro_bi_yearly: {} } ],
		[ 'string availability', pro( 'yes' ) ],
		[ 'numeric availability', pro( 1 ) ],
	] )( 'offers nothing for %s', ( _name, productsList ) => {
		expect( onSale( productsList ) ).toEqual( [] );
	} );
} );

describe( 'isProductOnSale', () => {
	const stateWith = ( hasReceivedThisSession: boolean ) =>
		( {
			productsList: { hasReceivedThisSession, items: pro( true ) },
		} ) as unknown as AppState;

	it( 'trusts a list received in this session', () => {
		expect( isProductOnSale( stateWith( true ), 'jetpack_pro_yearly' ) ).toBe( true );
	} );

	it( 'ignores a persisted list or one kept after a failed refresh', () => {
		expect( isProductOnSale( stateWith( false ), 'jetpack_pro_yearly' ) ).toBe( false );
	} );
} );
