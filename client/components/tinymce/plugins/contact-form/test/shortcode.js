/** @format */

/**
 * External dependencies
 */
import { serialize, deserialize } from '../shortcode-utils';

describe( 'contact form shortcode serializer', () => {
	test( 'should create an empty form if no definition provided', () => {
		const shortcode = serialize();

		expect( shortcode ).toEqual( '[contact-form][/contact-form]' );
	} );

	test( 'should correctly add both to and subject attributes', () => {
		const shortcode = serialize( {
			to: 'user@example.com',
			subject: 'contact form subject',
		} );

		expect( shortcode ).toEqual(
			'[contact-form to="user@example.com" subject="contact form subject"][/contact-form]'
		);
	} );

	test( 'should not add empty fields if none provided', () => {
		const shortcode = serialize( {
			fields: [],
		} );

		expect( shortcode ).toEqual( '[contact-form][/contact-form]' );
	} );

	test( 'should not add empty fields for empty objects', () => {
		const shortcode = serialize( {
			fields: [ {} ],
		} );

		expect( shortcode ).toEqual( '[contact-form][/contact-form]' );
	} );

	test( 'should not serialize fields with missing type', () => {
		const shortcode = serialize( {
			fields: [ { label: 'Name' } ],
		} );

		expect( shortcode ).toEqual( '[contact-form][/contact-form]' );
	} );

	test( 'should not serialize fields with missing labels', () => {
		const shortcode = serialize( {
			fields: [ { type: 'Name' } ],
		} );

		expect( shortcode ).toEqual( '[contact-form][/contact-form]' );
	} );

	test( 'should serialize a single field', () => {
		const shortcode = serialize( {
			fields: [ { type: 'text', label: 'Name' } ],
		} );

		expect( shortcode ).toEqual(
			'[contact-form][contact-field label="Name" type="text" /][/contact-form]'
		);
	} );

	test( 'should serialize multiple fields', () => {
		const shortcode = serialize( {
			fields: [ { type: 'text', label: 'First Name' }, { type: 'text', label: 'Last Name' } ],
		} );

		expect( shortcode ).toEqual(
			'[contact-form][contact-field label="First Name" type="text" /][contact-field label="Last Name" type="text" /][/contact-form]'
		);
	} );

	test( 'should serialize a required field', () => {
		const shortcode = serialize( {
			fields: [ { type: 'text', label: 'Name', required: true } ],
		} );

		expect( shortcode ).toEqual(
			'[contact-form][contact-field label="Name" type="text" required="1" /][/contact-form]'
		);
	} );

	test( 'should serialize a field with options', () => {
		const shortcode = serialize( {
			fields: [
				{
					type: 'dropdown',
					label: 'options',
					options: 'option 1,option 2,option 3',
					required: true,
				},
			],
		} );

		expect( shortcode ).toEqual(
			'[contact-form][contact-field label="options" type="dropdown" options="option 1,option 2,option 3" required="1" /][/contact-form]'
		);
	} );
} );

describe( 'contact form shortcode deserializer', () => {
	test( 'should deserialize an empty contact form', () => {
		const contactForm = deserialize( '[contact-form][/contact-form]' );

		expect( contactForm ).toEqual( { fields: [] } );
	} );

	test( 'should deserialize both to and subject attribute from the contact form shortcode', () => {
		const contactForm = deserialize(
			'[contact-form to="user@example.com" subject="contact form subject"][/contact-form]'
		);

		expect( contactForm ).toEqual( {
			to: 'user@example.com',
			subject: 'contact form subject',
			fields: [],
		} );
	} );

	test( 'should deserialize a field string', () => {
		const contactForm = deserialize(
			'[contact-form][contact-field label="name" type="text" /][/contact-form]'
		);

		expect( contactForm ).toEqual( {
			fields: [ { label: 'name', type: 'text' } ],
		} );
	} );

	test( 'should deserialize a required field string', () => {
		const contactForm = deserialize(
			'[contact-form][contact-field label="name" type="text" required="1" /][/contact-form]'
		);

		expect( contactForm ).toEqual( {
			fields: [ { label: 'name', type: 'text', required: true } ],
		} );
	} );

	test( 'should not deserialize invalid field string', () => {
		const contactForm = deserialize(
			'[contact-form][contact-field label="name" type="text" /][contact-field this is invalid [/contact-form]'
		);

		expect( contactForm ).toEqual( {
			fields: [ { label: 'name', type: 'text' } ],
		} );
	} );

	test( 'should deserialize a field with options', () => {
		const contactForm = deserialize(
			'[contact-form][contact-field label="options" type="dropdown" options="option 1,option 2,option 3" required="1" /][/contact-form]'
		);

		expect( contactForm ).toEqual( {
			fields: [
				{
					type: 'dropdown',
					label: 'options',
					options: 'option 1,option 2,option 3',
					required: true,
				},
			],
		} );
	} );
} );
