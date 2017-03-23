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
import { ResetPasswordFormComponent } from '..';
import ResetOptionSet from '../reset-option-set';

describe('ResetPasswordForm', () => {
    const exampleResetOptions = [
        {
            email: 'test@example.com',
            sms: '+15555555555',
            name: 'primary',
        },
        {
            email: 'test2@example.com',
            sms: '+16666666666',
            name: 'secondary',
        },
    ];

    const inputSelectors = [
        '.reset-password-form__email-option.primary',
        '.reset-password-form__email-option.secondary',
        '.reset-password-form__sms-option.primary',
        '.reset-password-form__sms-option.secondary',
    ];

    it('should render as expected', () => {
        const wrapper = shallow(<ResetPasswordFormComponent resetOptions={exampleResetOptions} />);

        expect(wrapper).to.have.state('isSubmitting').to.be.false;
        expect(wrapper.find(ResetOptionSet)).to.have.length(2);

        expect(wrapper.find('.reset-password-form__submit-button').prop('disabled')).to.be.ok;
    });

    context('fields', () => {
        useFakeDom();

        it('should be disabled while submitting', function() {
            const wrapper = mount(
                <ResetPasswordFormComponent resetOptions={exampleResetOptions} />
            );
            wrapper.find('.reset-password-form__email-option.primary').simulate('change');

            // Expect the button to be enabled
            expect(
                wrapper.find('.reset-password-form__submit-button').prop('disabled')
            ).to.not.be.ok;

            wrapper.find('.reset-password-form__submit-button').simulate('click');

            expect(wrapper).to.have.state('isSubmitting').to.be.true;

            // Expect the fields to be disabled
            inputSelectors.forEach(selector => {
                expect(wrapper.find(selector).prop('disabled')).to.be.ok;
            });
        });
    });

    context('submit button', () => {
        useFakeDom();

        it('should be disabled if no reset option is selected', function() {
            const wrapper = mount(
                <ResetPasswordFormComponent resetOptions={exampleResetOptions} />
            );

            // Expect the button to be disabled
            expect(wrapper.find('.reset-password-form__submit-button').prop('disabled')).to.be.ok;
        });

        it('should be disabled when clicked', function() {
            const wrapper = mount(
                <ResetPasswordFormComponent resetOptions={exampleResetOptions} />
            );

            wrapper.find('.reset-password-form__email-option.primary').simulate('click');
            wrapper.find('.reset-password-form__submit-button').simulate('click');

            expect(wrapper).to.have.state('isSubmitting').to.be.true;
            expect(wrapper.find('.reset-password-form__submit-button').prop('disabled')).to.be.ok;
        });
    });
});
