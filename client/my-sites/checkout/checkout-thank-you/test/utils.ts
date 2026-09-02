import { isDomainRegistration, isDomainTransfer, isDomainMapping } from '@automattic/calypso-products';
import { getDomainPurchaseTypeAndPredicate } from '../utils';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

jest.unmock( '@automattic/calypso-products' );

const baseReceiptPurchase: ReceiptPurchase = {
	delayedProvisioning: false,
	freeTrial: false,
	isDomainRegistration: false,
	meta: 'example.com',
	productId: 'product_id',
	productSlug: 'product_slug',
	productType: 'domain',
	productName: 'Product Name',
	productNameShort: 'Product',
	registrarSupportUrl: '',
	isEmailVerified: true,
	isRootDomainWithUs: true,
	isHundredYearDomain: false,
	isRenewal: false,
	saasRedirectUrl: '',
	newQuantity: undefined,
	blogId: 123,
	priceInteger: 1000,
};

const domainRegistration: ReceiptPurchase = {
	...baseReceiptPurchase,
	isDomainRegistration: true,
	productSlug: 'dotcom_domain',
};

const domainMapping: ReceiptPurchase = {
	...baseReceiptPurchase,
	isDomainRegistration: false,
	productSlug: 'domain_map',
};

const domainTransfer: ReceiptPurchase = {
	...baseReceiptPurchase,
	isDomainRegistration: false,
	productSlug: 'domain_transfer',
};

describe( 'getDomainPurchaseTypeAndPredicate', () => {
	it( 'returns REGISTRATION predicate for registration-only receipts', () => {
		const [ type, predicate ] = getDomainPurchaseTypeAndPredicate( [ domainRegistration ] );

		expect( type ).toBe( 'REGISTRATION' );
		expect( predicate ).toBe( isDomainRegistration );
	} );

	it( 'does not filter out registration purchases for registration-only receipts', () => {
		const purchases = [ domainRegistration ];
		const [ , predicate ] = getDomainPurchaseTypeAndPredicate( purchases );
		const filtered = purchases.filter( predicate );

		expect( filtered ).toHaveLength( 1 );
		expect( filtered[ 0 ] ).toBe( domainRegistration );
	} );

	it( 'returns REGISTRATION predicate when both mapping and registration are present', () => {
		const [ type, predicate ] = getDomainPurchaseTypeAndPredicate( [
			domainMapping,
			domainRegistration,
		] );

		expect( type ).toBe( 'REGISTRATION' );
		expect( predicate ).toBe( isDomainRegistration );
	} );

	it( 'returns MAPPING predicate when only mapping is present', () => {
		const [ type, predicate ] = getDomainPurchaseTypeAndPredicate( [ domainMapping ] );

		expect( type ).toBe( 'MAPPING' );
		expect( predicate ).toBe( isDomainMapping );
	} );

	it( 'returns TRANSFER predicate when only transfers are present', () => {
		const [ type, predicate ] = getDomainPurchaseTypeAndPredicate( [ domainTransfer ] );

		expect( type ).toBe( 'TRANSFER' );
		expect( predicate ).toBe( isDomainTransfer );
	} );
} );
