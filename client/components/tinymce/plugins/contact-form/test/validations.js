/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { validateFormFields, validateSettingsToEmail } from '../dialog/validations';

describe( 'contact form validations', () => {
	describe( '#validateFormFields()', function() {
		it( 'should fail on an empty form', function() {
			expect( validateFormFields( [] ) ).to.be.false;
		} );

		it( 'should accept a single valid field', function() {
			expect(
				validateFormFields( [
					{
						type: 'text',
						label: 'something',
					},
				] )
			).to.be.true;
		} );

		it( 'should fail on a single invalid field', function() {
			expect(
				validateFormFields( [
					{
						type: 'text',
						label: '',
					},
				] )
			).to.be.false;
		} );

		it( 'should require a label in every field', function() {
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

		it( 'should fail if a radio does not have options', function() {
			expect(
				validateFormFields( [
					{
						type: 'radio',
						label: 'a',
					},
				] )
			).to.be.false;
		} );

		it( 'should fail if a select does not have options', function() {
			expect(
				validateFormFields( [
					{
						type: 'select',
						label: 'a',
					},
				] )
			).to.be.false;
		} );

		it( 'should accept a complex form', function() {
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

	describe( '#validateSettingsToEmail()', function() {
		it( 'should validate a single e-mail', function() {
			expect( validateSettingsToEmail( 'something@example.com' ) ).to.be.true;
		} );

		it( 'should accept an empty string', function() {
			expect( validateSettingsToEmail( '' ) ).to.be.true;
		} );

		it( 'should fail on invalid e-mail', function() {
			expect( validateSettingsToEmail( 'hocus_pocus' ) ).to.be.false;
		} );

		it( 'should validate multiple comma-separated e-mails', function() {
			expect( validateSettingsToEmail( 'something@example.com,another@example.com' ) ).to.be.true;
		} );

		it( 'should ignore trailing and leading whitespace', function() {
			expect( validateSettingsToEmail( '  something@example.com ,  another@example.com  ' ) ).to.be
				.true;
		} );

		it( 'should fail if one e-mail is invalid', function() {
			expect( validateSettingsToEmail( 'something@example.com, hocus_pocus' ) ).to.be.false;
		} );
	} );
} );
