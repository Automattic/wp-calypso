/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { parse } from 'qs';

/**
 * Internal dependencies
 */
import ErrorScreen from 'account-recovery/error-screen';
import {
	updatePasswordResetUserData,
	setResetMethod,
	validateRequest,
	validateRequestError,
} from 'state/account-recovery/reset/actions';

import getAccountRecoveryValidationError from 'state/selectors/get-account-recovery-validation-error';
import getAccountRecoveryValidationKey from 'state/selectors/get-account-recovery-validation-key';

/**
 * Style dependencies
 */
import './style.scss';

class ResetPasswordEmailValidation extends Component {
	getQueryString = () => {
		const queryString = get( window, 'location.search', null );

		if ( ! queryString ) {
			return '';
		}

		return queryString.slice( 1 );
	};

	parseQueryArgs = () => parse( this.getQueryString() );

	componentDidMount = () => {
		const { user, method, key } = this.parseQueryArgs();

		this.props.validateRequest( { user }, method, key );
	};

	componentWillReceiveProps = nextProps => {
		if ( ! this.props.validationKey && nextProps.validationKey ) {
			const { user, method } = this.parseQueryArgs();

			// Fill in the user & method field only if the validation is succeeded.
			// <AccountRecoveryRoot> component is using redux state to determine which AR step we're at.
			// Thus, we need to confirm if these data are correct before filling in, otherwise users would
			// arrive at wrong steps.
			this.props.updatePasswordResetUserData( { user } );
			this.props.setResetMethod( method );
		}
	};

	render = () => {
		const { error } = this.props;

		return error ? <ErrorScreen error={ error } /> : null;
	};
}

export default connect(
	state => ( {
		error: getAccountRecoveryValidationError( state ),
		validationKey: getAccountRecoveryValidationKey( state ),
	} ),
	{
		updatePasswordResetUserData,
		setResetMethod,
		validateRequest,
		validateRequestError,
	}
)( localize( ResetPasswordEmailValidation ) );
