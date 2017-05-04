/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import qs from 'qs';

/**
 * Internal dependencies
 */
import Card from 'components/card';

import {
	updatePasswordResetUserData,
	setResetMethod,
	setValidationKey,
	validateRequest,
	validateRequestError,
} from 'state/account-recovery/reset/actions';

import {
	getAccountRecoveryValidationError,
	getAccountRecoveryValidationKey,
} from 'state/selectors';

class ResetPasswordEmailValidation extends Component {
	getQueryString = () => {
		const queryString = get( window, 'location.search', null );

		if ( ! queryString ) {
			return '';
		}

		return queryString.slice( 1 );
	}

	parseQueryArgs = () => ( qs.parse( this.getQueryString() ) );

	componentDidMount = () => {
		const {
			user,
			method,
			key,
		} = this.parseQueryArgs();

		if ( ! user || ! method || ! key ) {
			this.props.validateRequestError( {
				message: this.props.translate( 'The validation URL is incomplete.' ),
			} );

			return;
		}

		this.props.validateRequest( { user }, method, key );
	}

	componentWillReceiveProps = ( nextProps ) => {
		if ( ! this.props.validationKey && nextProps.validationKey ) {
			const {
				user,
				method,
			} = this.parseQueryArgs();

			// Fill in the user & method field only if the validation is succeeded.
			// <AccountRecoveryRoot> component is using redux state to determine which AR step we're at.
			// Thus, we need to confirm if these data are correct before filling in, otherwise users would
			// arrive at wrong steps.
			this.props.updatePasswordResetUserData( { user } );
			this.props.setResetMethod( method );
		}
	}

	renderValidating = () => (
		<p className="reset-code-validation__text-validating">{ this.props.translate( 'Validating' ) }</p>
	)

	renderErrorMsg = ( error ) => (
		<p className="reset-code-validation__text-error">
			{ error.message ? this.props.translate( "We've encountered an error: " ) + error.message
				: this.props.translate( "We've failed to validate with the given URL." ) }
		</p>
	)

	render = () => {
		const { error } = this.props;

		return (
			<Card className="reset-code-validation__content">
				{ error ? this.renderErrorMsg( error ) : this.renderValidating() }
			</Card>
		);
	}
}

export default connect(
	( state ) => ( {
		error: getAccountRecoveryValidationError( state ),
		validationKey: getAccountRecoveryValidationKey( state ),
	} ),
	{
		updatePasswordResetUserData,
		setResetMethod,
		setValidationKey,
		validateRequest,
		validateRequestError,
	}
)( localize( ResetPasswordEmailValidation ) );
