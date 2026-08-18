import { CartActionError } from '@automattic/shopping-cart';
import {
	ERROR_ALREADY_CONTAINS_AN_EMAIL_PRODUCT,
	getAddToCartErrorNoticeOptions,
} from 'calypso/my-sites/email/add-mailboxes/get-add-to-cart-error-notice-options';
import type { translate as translateType } from 'i18n-calypso';

const translate = ( ( text: string ) => text ) as unknown as typeof translateType;
const checkoutPath = '/checkout/example.com';

describe( 'getAddToCartErrorNoticeOptions', () => {
	it( 'links to the cart when the cart already holds an email product', () => {
		const error = new CartActionError(
			'This domain already has an email subscription in your cart.',
			ERROR_ALREADY_CONTAINS_AN_EMAIL_PRODUCT
		);

		expect( getAddToCartErrorNoticeOptions( { checkoutPath, error, translate } ) ).toEqual( {
			id: ERROR_ALREADY_CONTAINS_AN_EMAIL_PRODUCT,
			isPersistent: true,
			button: 'Shopping cart',
			href: checkoutPath,
		} );
	} );

	it( 'omits the cart link for errors the cart cannot resolve', () => {
		const error = new CartActionError( 'Purchases are currently disabled.', 'blocked' );

		const noticeOptions = getAddToCartErrorNoticeOptions( { checkoutPath, error, translate } );

		expect( noticeOptions ).toEqual( { id: 'blocked', isPersistent: true } );
		expect( noticeOptions.button ).toBeUndefined();
		expect( noticeOptions.href ).toBeUndefined();
	} );

	it( 'ids the notice by the cart message code so it does not stack with CartMessages', () => {
		const error = new CartActionError( 'Something went wrong.', 'some-cart-error' );

		expect( getAddToCartErrorNoticeOptions( { checkoutPath, error, translate } ).id ).toEqual(
			'some-cart-error'
		);
	} );
} );
