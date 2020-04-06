/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { validateFormFields, validateSettingsToEmail } from '../dialog/validations';

describe( 'contact form validations', () => {
	describe( '#validateFormFields()', () => {
		test( 'should fail on an empty form', () => {
			expect( validateFormFields( [] ) ).to.be.false;
		} );

		test( 'should accept a single valid field', () => {
			expect(
				validateFormFields( [
					{
						type: 'text',
						label: 'something',
					},
				] )
			).to.be.true;
		} );

		test( 'should fail on a single invalid field', () => {
			expect(
				validateFormFields( [
					{
						type: 'text',
						label: '',
					},
				] )
			).to.be.false;
		} );

		test( 'should require a label in every field', () => {
			expect(
				validateFormFields( [
					{
						type: 'text',
						label: 'a',
					},
					{
						type: 'text',
						label: 'b',
					},
					{
						type: 'text',
						label: '',
					},
				] )
			).to.be.false;
		} );

		test( 'should fail if a radio does not have options', () => {
			expect(
				validateFormFields( [
					{
						type: 'radio',
						label: 'a',
					},
				] )
			).to.be.false;
		} );

		test( 'should fail if a select does not have options', () => {
			expect(
				validateFormFields( [
					{
						type: 'select',
						label: 'a',
					},
				] )
			).to.be.false;
		} );

		test( 'should accept a complex form', () => {
			expect(
				validateFormFields( [
					{
						type: 'text',
						label: 'a',
						required: true,
					},
					{
						type: 'textarea',
						label: 'b',
					},
					{
						type: 'url',
						label: 'c',
					},
					{
						type: 'radio',
						label: 'd',
						options: '1,2',
					},
					{
						type: 'select',
						label: 'e',
						options: 'x,y,z',
					},
				] )
			).to.be.true;
		} );
	} );

	describe( '#validateSettingsToEmail()', () => {
		test( 'should validate a single e-mail', () => {
			expect( validateSettingsToEmail( 'something@example.com' ) ).to.be.true;
		} );

		test( 'should accept an empty string', () => {
			expect( validateSettingsToEmail( '' ) ).to.be.true;
		} );

		test( 'should fail on invalid e-mail', () => {
			expect( validateSettingsToEmail( 'hocus_pocus' ) ).to.be.false;
		} );

		test( 'should validate multiple comma-separated e-mails', () => {
			expect( validateSettingsToEmail( 'something@example.com,another@example.com' ) ).to.be.true;
		} );

		test( 'should ignore trailing and leading whitespace', () => {
			expect( validateSettingsToEmail( '  something@example.com ,  another@example.com  ' ) ).to.be
				.true;
		} );

		test( 'should fail if one e-mail is invalid', () => {
			expect( validateSettingsToEmail( 'something@example.com, hocus_pocus' ) ).to.be.false;
		} );
	} );
} );
