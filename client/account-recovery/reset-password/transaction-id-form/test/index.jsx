/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import { TransactionIdFormComponent } from '..';

describe( 'TransactionIdForm', () => {
	it( 'should render as expected', () => {
		const wrapper = shallow( <TransactionIdFormComponent /> );

		expect( wrapper ).to.have.state( 'isSubmitting' ).to.be.false;
		expect( wrapper.find( '.transaction-id-form__transaction-id-input' ).prop( 'disabled' ) ).to.not.be.ok;
		expect( wrapper.find( '.transaction-id-form__continue-button' ).prop( 'disabled' ) ).to.be.ok;
		expect( wrapper.find( '.transaction-id-form__skip-button' ).prop( 'disabled' ) ).to.not.be.ok;
	} );

	context( 'events', () => {
		useFakeDom();

		it( 'continue button should be disabled if transaction id is blank', function() {
			const wrapper = mount( <TransactionIdFormComponent className="test__test" /> );

			wrapper.find( '.transaction-id-form__transaction-id-input' ).node.value = '';
			wrapper.find( '.transaction-id-form__transaction-id-input' ).simulate( 'change' );
			expect( wrapper.find( '.transaction-id-form__transaction-id-input' ).prop( 'disabled' ) ).to.not.be.ok;
			expect( wrapper.find( '.transaction-id-form__continue-button' ).prop( 'disabled' ) ).to.be.ok;
		} );

		it( 'should be disabled when continue button clicked', function() {
			const wrapper = mount( <TransactionIdFormComponent className="test__test" /> );

			wrapper.find( '.transaction-id-form__transaction-id-input' ).node.value = 'test';
			wrapper.find( '.transaction-id-form__transaction-id-input' ).simulate( 'change' );
			wrapper.find( '.transaction-id-form__continue-button' ).simulate( 'click' );

			expect( wrapper ).to.have.state( 'isSubmitting' ).to.be.true;
			expect( wrapper.find( '.transaction-id-form__transaction-id-input' ).prop( 'disabled' ) ).to.be.ok;
			expect( wrapper.find( '.transaction-id-form__continue-button' ).prop( 'disabled' ) ).to.be.ok;
		} );
	} );
} );
