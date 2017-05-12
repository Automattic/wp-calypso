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
import EmptyContent from 'components/empty-content';

import {
	updatePasswordResetUserData,
	setResetMethod,
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

	getErrorMsg = ( errorIdentifier ) => {
		const { translate } = this.props;

		switch ( errorIdentifier ) {
			case 'RestInvalidKeyError':
				return {
					title: translate( "We've failed to validate using the given link." ),
					line: translate(
						'Please try to {{a}}request a new one or try the other methods{{/a}}.',
						{ components: {
							a: <a href={ '/account-recovery/' } />
						} }
					),
				};
		}

		return {
			title: translate( "We've run into an unexpected error. We're sorry! " ),
			line: translate(
				'Please try to {{a}}reset your password again{{/a}}.',
				{ components: {
					a: <a href={ '/account-recovery/' } />
				} }
			),
		};
	}

	renderErrorMsg = ( error ) => {
		const { title, line } = this.getErrorMsg( error.name );

		return (
			<EmptyContent
				illustration="/calypso/images/illustrations/illustration-500.svg"
				title={ title }
				line={ line }
			/>
		);
	}

	render = () => {
		const { error } = this.props;

		return error ? this.renderErrorMsg( error ) : null;
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
		validateRequest,
		validateRequestError,
	}
)( localize( ResetPasswordEmailValidation ) );
