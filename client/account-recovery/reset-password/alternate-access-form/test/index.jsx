/**
 * External dependencies
 */
import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import { AlternateAccessFormComponent } from '..';

describe( 'AlternateAccessForm', () => {
	useFakeDom();

	it( 'should render as expected', () => {
		const label = 'Test Field';
		const description = 'Test description';
		const onSkip = () => {};
		const onContinue = () => {};
		const wrapper = mount(
			<AlternateAccessFormComponent
				onSkip={ onSkip } onContinue={ onContinue }
				label={ label } description={ description }
			/>
		);

		expect( wrapper ).to.have.state( 'isSubmitting' ).to.be.false;
		expect( wrapper.find( '.alternate-access-form__field-label' ).text() ).to.be.eql( label );
		expect( wrapper.find( '.alternate-access-form__field-description' ).text() ).to.be.eql( description );
		expect( wrapper.find( '.alternate-access-form__field-input' ).prop( 'disabled' ) ).to.not.be.ok;
		expect( wrapper.find( '.alternate-access-form__continue-button' ).prop( 'disabled' ) ).to.be.ok;
		expect( wrapper.find( '.alternate-access-form__skip-button' ).prop( 'disabled' ) ).to.not.be.ok;
	} );

	it( 'should render as expected without skip button', () => {
		const label = 'Test Field';
		const description = 'Test description';
		const onContinue = () => {};
		const wrapper = mount(
			<AlternateAccessFormComponent
				onContinue={ onContinue }
				label={ label } description={ description }
			/>
		);

		expect( wrapper ).to.have.state( 'isSubmitting' ).to.be.false;
		expect( wrapper.find( '.alternate-access-form__field-label' ).text() ).to.be.eql( label );
		expect( wrapper.find( '.alternate-access-form__field-description' ).text() ).to.be.eql( description );
		expect( wrapper.find( '.alternate-access-form__field-input' ).prop( 'disabled' ) ).to.not.be.ok;
		expect( wrapper.find( '.alternate-access-form__continue-button' ).prop( 'disabled' ) ).to.be.ok;
		expect( wrapper.find( '.alternate-access-form__skip-button' ) ).to.not.be.present();
	} );

	context( 'events', () => {
		it( 'continue button should be disabled when field is blank', function() {
			const label = 'Test Field';
			const description = 'Test description';
			const wrapper = mount( <AlternateAccessFormComponent label={ label } description={ description } /> );

			wrapper.find( '.alternate-access-form__field-input' ).node.value = '';
			wrapper.find( '.alternate-access-form__field-input' ).simulate( 'change' );
			expect( wrapper.find( '.alternate-access-form__field-input' ).prop( 'disabled' ) ).to.not.be.ok;
			expect( wrapper.find( '.alternate-access-form__continue-button' ).prop( 'disabled' ) ).to.be.ok;
		} );

		it( 'should be disabled when continue button clicked', function() {
			const label = 'Test Field';
			const description = 'Test description';
			const wrapper = mount( <AlternateAccessFormComponent label={ label } description={ description } /> );

			wrapper.find( '.alternate-access-form__field-input' ).node.value = 'test';
			wrapper.find( '.alternate-access-form__field-input' ).simulate( 'change' );
			wrapper.find( '.alternate-access-form__continue-button' ).simulate( 'click' );

			expect( wrapper ).to.have.state( 'isSubmitting' ).to.be.true;
			expect( wrapper.find( '.alternate-access-form__field-input' ).prop( 'disabled' ) ).to.be.ok;
			expect( wrapper.find( '.alternate-access-form__continue-button' ).prop( 'disabled' ) ).to.be.ok;
		} );

		it( 'should execute callback with value when continue button clicked', function() {
			const label = 'Test Field';
			const description = 'Test description';
			const testValue = 'testing';
			const onContinue = spy();
			const wrapper = mount(
				<AlternateAccessFormComponent
					onContinue={ onContinue } label={ label } description={ description }
				/>
			);

			wrapper.find( '.alternate-access-form__field-input' ).node.value = testValue;
			wrapper.find( '.alternate-access-form__field-input' ).simulate( 'change' );
			wrapper.find( '.alternate-access-form__continue-button' ).simulate( 'click' );

			expect( onContinue ).to.have.been.calledOnce;
			expect( onContinue ).to.have.been.calledWith( testValue );
		} );

		it( 'should execute callback when skip button clicked', function() {
			const label = 'Test Field';
			const description = 'Test description';
			const onSkip = spy();
			const wrapper = mount(
				<AlternateAccessFormComponent
					onSkip={ onSkip } label={ label } description={ description }
				/>
			);

			wrapper.find( '.alternate-access-form__skip-button' ).simulate( 'click' );

			expect( onSkip ).to.have.been.calledOnce;
		} );
	} );
} );
