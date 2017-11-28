/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import React from 'react';

/**
 * Internal dependencies
 */
import { TransactionIdFormComponent } from '..';

describe( 'TransactionIdForm', () => {
	test( 'should render as expected', () => {
		const wrapper = shallow( <TransactionIdFormComponent /> );

		expect( wrapper ).to.have.state( 'isSubmitting' ).to.be.false;
		expect( wrapper.find( '.transaction-id-form__transaction-id-input' ).prop( 'disabled' ) ).to.not
			.be.ok;
		expect( wrapper.find( '.transaction-id-form__continue-button' ).prop( 'disabled' ) ).to.be.ok;
		expect( wrapper.find( '.transaction-id-form__skip-button' ).prop( 'disabled' ) ).to.not.be.ok;
	} );

	describe( 'events', () => {
		test( 'continue button should be disabled if transaction id is blank', () => {
			const wrapper = mount( <TransactionIdFormComponent className="test__test" /> );

			wrapper
				.find( '.form-text-input.transaction-id-form__transaction-id-input' )
				.simulate( 'change' );
			expect(
				wrapper
					.find( '.transaction-id-form__transaction-id-input' )
					.first()
					.prop( 'disabled' )
			).to.not.be.ok;
			expect(
				wrapper
					.find( '.transaction-id-form__continue-button' )
					.first()
					.prop( 'disabled' )
			).to.be.ok;
		} );

		test( 'should be disabled when continue button clicked', () => {
			const wrapper = mount( <TransactionIdFormComponent className="test__test" /> );
			wrapper.setState( { transactionId: 1 } );

			wrapper.find( 'button.transaction-id-form__continue-button' ).simulate( 'click' );
			expect( wrapper ).to.have.state( 'isSubmitting' ).to.be.true;
			expect(
				wrapper
					.find( '.transaction-id-form__transaction-id-input' )
					.first()
					.prop( 'disabled' )
			).to.be.ok;
			expect(
				wrapper
					.find( '.transaction-id-form__continue-button' )
					.first()
					.prop( 'disabled' )
			).to.be.ok;
		} );
	} );
} );
