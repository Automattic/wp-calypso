import { getTicketFieldMetadata } from '../src/ticket-field-metadata';

describe( 'getTicketFieldMetadata', () => {
	it( 'sets each ticket field by ID', () => {
		expect(
			getTicketFieldMetadata( { 25254766: 'woocommerce_subscriptions', 123: true } )
		).toEqual( {
			'zen:ticket_field:25254766': 'woocommerce_subscriptions',
			'zen:ticket_field:123': true,
		} );
	} );

	it( 'leaves out empty values so they don’t clear a field', () => {
		expect( getTicketFieldMetadata( { 1: '', 2: null, 3: undefined, 4: 0, 5: false } ) ).toEqual( {
			'zen:ticket_field:4': 0,
			'zen:ticket_field:5': false,
		} );
	} );
} );
