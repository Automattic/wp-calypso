/** @format */
/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import { serialize, deserialize } from '../shortcode-utils';

describe( 'contact form shortcode serializer', () => {
	it( 'should create an empty form if no definition provided', () => {
		const shortcode = serialize();

		assert.equal( shortcode, '[contact-form][/contact-form]' );
	} );

	it( 'should correctly add both to and subject attributes', () => {
		const shortcode = serialize( {
			to: 'user@example.com',
			subject: 'contact form subject',
		} );

		assert.equal(
			shortcode,
			'[contact-form to="user@example.com" subject="contact form subject"][/contact-form]'
		);
	} );

	it( 'should not add empty fields if none provided', () => {
		const shortcode = serialize( {
			fields: [],
		} );

		assert.equal( shortcode, '[contact-form][/contact-form]' );
	} );

	it( 'should not add empty fields for empty objects', () => {
		const shortcode = serialize( {
			fields: [ {} ],
		} );

		assert.equal( shortcode, '[contact-form][/contact-form]' );
	} );

	it( 'should not serialize fields with missing type', () => {
		const shortcode = serialize( {
			fields: [ { label: 'Name' } ],
		} );

		assert.equal( shortcode, '[contact-form][/contact-form]' );
	} );

	it( 'should not serialize fields with missing labels', () => {
		const shortcode = serialize( {
			fields: [ { type: 'Name' } ],
		} );

		assert.equal( shortcode, '[contact-form][/contact-form]' );
	} );

	it( 'should serialize a single field', () => {
		const shortcode = serialize( {
			fields: [ { type: 'text', label: 'Name' } ],
		} );

		assert.equal(
			shortcode,
			'[contact-form][contact-field label="Name" type="text" /][/contact-form]'
		);
	} );

	it( 'should serialize multiple fields', () => {
		const shortcode = serialize( {
			fields: [ { type: 'text', label: 'First Name' }, { type: 'text', label: 'Last Name' } ],
		} );

		assert.equal(
			shortcode,
			'[contact-form][contact-field label="First Name" type="text" /][contact-field label="Last Name" type="text" /][/contact-form]'
		);
	} );

	it( 'should serialize a required field', () => {
		const shortcode = serialize( {
			fields: [ { type: 'text', label: 'Name', required: true } ],
		} );

		assert.equal(
			shortcode,
			'[contact-form][contact-field label="Name" type="text" required="1" /][/contact-form]'
		);
	} );

	it( 'should serialize a field with options', () => {
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

		assert.equal(
			shortcode,
			'[contact-form][contact-field label="options" type="dropdown" options="option 1,option 2,option 3" required="1" /][/contact-form]'
		);
	} );
} );

describe( 'contact form shortcode deserializer', () => {
	it( 'should deserialize an empty contact form', () => {
		const contactForm = deserialize( '[contact-form][/contact-form]' );

		assert.deepEqual( contactForm, { fields: [] } );
	} );

	it( 'should deserialize both to and subject attribute from the contact form shortcode', () => {
		const contactForm = deserialize(
			'[contact-form to="user@example.com" subject="contact form subject"][/contact-form]'
		);

		assert.deepEqual( contactForm, {
			to: 'user@example.com',
			subject: 'contact form subject',
			fields: [],
		} );
	} );

	it( 'should deserialize a field string', () => {
		const contactForm = deserialize(
			'[contact-form][contact-field label="name" type="text" /][/contact-form]'
		);

		assert.deepEqual( contactForm, {
			fields: [ { label: 'name', type: 'text' } ],
		} );
	} );

	it( 'should deserialize a required field string', () => {
		const contactForm = deserialize(
			'[contact-form][contact-field label="name" type="text" required="1" /][/contact-form]'
		);

		assert.deepEqual( contactForm, {
			fields: [ { label: 'name', type: 'text', required: true } ],
		} );
	} );

	it( 'should not deserialize invalid field string', () => {
		const contactForm = deserialize(
			'[contact-form][contact-field label="name" type="text" /][contact-field this is invalid [/contact-form]'
		);

		assert.deepEqual( contactForm, {
			fields: [ { label: 'name', type: 'text' } ],
		} );
	} );

	it( 'should deserialize a field with options', () => {
		const contactForm = deserialize(
			'[contact-form][contact-field label="options" type="dropdown" options="option 1,option 2,option 3" required="1" /][/contact-form]'
		);

		assert.deepEqual( contactForm, {
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
