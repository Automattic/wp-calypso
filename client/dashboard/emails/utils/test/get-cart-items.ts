import { TitanMailSlugs } from '@automattic/api-core';
import { titanMailProduct } from '../get-cart-items';

const mailbox = { email: 'info@example.com', password: 'secret' };

describe( 'titanMailProduct', () => {
	it( 'keeps an explicit new_quantity', () => {
		const cartItem = titanMailProduct(
			{
				domain: 'example.com',
				quantity: 2,
				extra: { email_users: [ mailbox, mailbox ], new_quantity: 2 },
			},
			TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG
		);

		expect( cartItem.extra?.new_quantity ).toBe( 2 );
	} );

	it( 'uses the number of mailboxes when new_quantity is missing', () => {
		const cartItem = titanMailProduct(
			{
				domain: 'example.com',
				extra: { email_users: [ mailbox, mailbox, mailbox ] },
			},
			TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG
		);

		expect( cartItem.extra?.new_quantity ).toBe( 3 );
	} );

	it( 'uses the number of mailboxes when new_quantity is 0', () => {
		const cartItem = titanMailProduct(
			{
				domain: 'example.com',
				extra: { email_users: [ mailbox ], new_quantity: 0 },
			},
			TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG
		);

		expect( cartItem.extra?.new_quantity ).toBe( 1 );
	} );

	it( 'defaults new_quantity to 1 when there is no mailbox count at all', () => {
		const cartItem = titanMailProduct(
			{ domain: 'example.com' },
			TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG
		);

		expect( cartItem.extra?.new_quantity ).toBe( 1 );
	} );

	it( 'keeps the other extra fields', () => {
		const cartItem = titanMailProduct(
			{
				domain: 'example.com',
				extra: { email_users: [ mailbox ], new_quantity: 1 },
			},
			TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG
		);

		expect( cartItem.extra?.email_users ).toEqual( [ mailbox ] );
	} );
} );
