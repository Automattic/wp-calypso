/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { identity, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import FormLabel from 'components/forms/form-label';
import FormInput from 'components/forms/form-text-input';

import {
    fetchResetOptionsByNameAndUrl,
    updatePasswordResetUserData,
} from 'state/account-recovery/reset/actions';

import {
    isRequestingAccountRecoveryResetOptions,
    getAccountRecoveryResetUserData,
    getAccountRecoveryResetOptionsError,
} from 'state/selectors';

export class ForgotUsernameFormComponent extends Component {
    submitForm = () => {
        const { userData } = this.props;

        this.props.fetchResetOptionsByNameAndUrl(
            userData.firstName,
            userData.lastName,
            userData.url
        );
    };

    firstNameUpdated = event => {
        this.props.updatePasswordResetUserData({ firstName: event.target.value });
    };

    lastNameUpdated = event => {
        this.props.updatePasswordResetUserData({ lastName: event.target.value });
    };

    siteUrlUpdated = event => {
        this.props.updatePasswordResetUserData({ url: event.target.value });
    };

    getErrorMessage = requestError => {
        const { translate } = this.props;

        if (!requestError) {
            return '';
        }

        if (requestError.statusCode === 404) {
            return translate(
                "We're not able to find an account matching that information. " +
                    'Double-check your spelling, or try another name or URL.'
            );
        }

        return translate("We've encountered some technical issues. Please try again later.");
    };

    render() {
        const {
            translate,
            userData,
            isRequesting,
            requestError,
        } = this.props;

        const {
            firstName = '',
            lastName = '',
            url = '',
        } = userData;

        const isPrimaryButtonEnabled = firstName && lastName && url && !isRequesting;

        return (
            <Card>
                <h2 className="forgot-username-form__title">
                    {translate('Forgot your username?')}
                </h2>
                <p>{translate('Enter your full name and URL instead.')}</p>
                <FormLabel>
                    {translate('First Name')}
                    <FormInput
                        className="forgot-username-form__first-name-input"
                        onChange={this.firstNameUpdated}
                        value={firstName}
                        disabled={isRequesting}
                    />
                </FormLabel>
                <FormLabel>
                    {translate('Last Name')}
                    <FormInput
                        className="forgot-username-form__last-name-input"
                        onChange={this.lastNameUpdated}
                        value={lastName}
                        disabled={isRequesting}
                    />
                </FormLabel>
                <FormLabel>
                    {translate("Your site's URL")}
                    <FormInput
                        className="forgot-username-form__site-url-input"
                        onChange={this.siteUrlUpdated}
                        value={url}
                        disabled={isRequesting}
                    />
                </FormLabel>
                {requestError &&
                    <p className="forgot-username-form__error-message">
                        {this.getErrorMessage(requestError)}
                    </p>}
                <Button
                    className="forgot-username-form__submit-button"
                    onClick={this.submitForm}
                    disabled={!isPrimaryButtonEnabled}
                    primary
                >
                    {translate('Continue')}
                </Button>
            </Card>
        );
    }
}

ForgotUsernameFormComponent.defaultProps = {
    isRequesting: false,
    userData: {},
    requestError: null,
    translate: identity,
    fetchResetOptionsByNameAndUrl: noop,
    updatePasswordResetUserData: noop,
};

export default connect(
    state => ({
        isRequesting: isRequestingAccountRecoveryResetOptions(state),
        userData: getAccountRecoveryResetUserData(state),
        requestError: getAccountRecoveryResetOptionsError(state),
    }),
    {
        fetchResetOptionsByNameAndUrl,
        updatePasswordResetUserData,
    }
)(localize(ForgotUsernameFormComponent));
