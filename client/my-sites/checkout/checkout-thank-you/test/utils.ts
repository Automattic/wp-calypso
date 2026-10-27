import { getDomainPurchaseTypeAndPredicate } from '../utils';
import type { ReceiptPurchase } from 'calypso/my-sites/checkout/checkout-thank-you/receipt';

const purchase = ( overrides: Partial< ReceiptPurchase > ) =>
	( {
		productSlug: 'dotcom_domain',
		isDomainRegistration: false,
		meta: 'example.com',
		...overrides,
	} ) as ReceiptPurchase;

const registration = purchase( { productSlug: 'dotcom_domain', isDomainRegistration: true } );
const mapping = purchase( { productSlug: 'domain_map' } );
const transfer = purchase( { productSlug: 'domain_transfer' } );

describe( 'getDomainPurchaseTypeAndPredicate', () => {
	it( 'selects the registration when a receipt has a registration and a mapping', () => {
		const purchases = [ registration, mapping ];
		const [ type, predicate ] = getDomainPurchaseTypeAndPredicate( purchases );

		expect( type ).toBe( 'REGISTRATION' );
		expect( purchases.filter( predicate ) ).toEqual( [ registration ] );
	} );

	it( 'selects the registration when a receipt has only a registration', () => {
		const purchases = [ registration ];
		const [ type, predicate ] = getDomainPurchaseTypeAndPredicate( purchases );

		expect( type ).toBe( 'REGISTRATION' );
		expect( purchases.filter( predicate ) ).toEqual( [ registration ] );
	} );

	it( 'selects the mapping when a receipt has only a mapping', () => {
		const purchases = [ mapping ];
		const [ type, predicate ] = getDomainPurchaseTypeAndPredicate( purchases );

		expect( type ).toBe( 'MAPPING' );
		expect( purchases.filter( predicate ) ).toEqual( [ mapping ] );
	} );

	it( 'selects the transfer when a receipt has only a transfer', () => {
		const purchases = [ transfer ];
		const [ type, predicate ] = getDomainPurchaseTypeAndPredicate( purchases );

		expect( type ).toBe( 'TRANSFER' );
		expect( purchases.filter( predicate ) ).toEqual( [ transfer ] );
	} );
} );
