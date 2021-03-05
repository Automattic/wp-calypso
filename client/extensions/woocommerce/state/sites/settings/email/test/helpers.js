/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { checkEmails } from 'woocommerce/app/settings/email/email-settings/components/helpers';

describe( 'helpers', () => {
	describe( '#checkEmails', () => {
		test( 'should return error false on empty string.', () => {
			expect( checkEmails( '' ) ).to.eql( { error: false } );
		} );
		test( 'should return error false on valid email.', () => {
			expect( checkEmails( 'a@a.com' ) ).to.eql( { error: false } );
		} );
		test( 'should return error false on valid comma separated emails.', () => {
			expect( checkEmails( 'a@a.com, b@b.com' ) ).to.eql( { error: false } );
		} );
		test( 'should return error false on valid email with trailing comma.', () => {
			expect( checkEmails( 'a@a.com,' ) ).to.eql( { error: false } );
		} );
		test( 'should return error comma separations error on missing commas', () => {
			expect( checkEmails( 'a@a.com b@b.com' ) ).to.eql( {
				error: true,
				messages: [
					{
						error: true,
						msg: 'a@a.com b@b.com need to be comma separated.',
					},
				],
			} );
		} );
		test( 'should return error on invalid email address', () => {
			expect( checkEmails( 'a@a.co!' ) ).to.eql( {
				error: true,
				messages: [
					{
						error: true,
						msg: 'a@a.co! is not a valid email address.',
					},
				],
			} );
		} );
		test( 'should return proper error message when not all items are wrong', () => {
			expect( checkEmails( 'a@a.com, b@bcom' ) ).to.eql( {
				error: true,
				messages: [
					{
						error: true,
						msg: ' b@bcom is not a valid email address.',
					},
				],
			} );
		} );
		test( 'should return missing items error message', () => {
			expect( checkEmails( 'a@a.com,,' ) ).to.eql( {
				error: true,
				messages: [
					{
						error: true,
						msg: 'Empty values between commas',
					},
				],
			} );
		} );
	} );
} );
