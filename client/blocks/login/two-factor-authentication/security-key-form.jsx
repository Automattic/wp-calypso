/** @format */

/**
 * External dependencies
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import { localize } from 'i18n-calypso';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import { formUpdate, loginUserWithSecurityKey } from 'state/login/actions';
import TwoFactorActions from './two-factor-actions';

/**
 * Style dependencies
 */
import './verification-code-form.scss';

class SecurityKeyForm extends Component {
	static propTypes = {
		formUpdate: PropTypes.func.isRequired,
		loginUserWithSecurityKey: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		showError: false,
	};

	componentDidMount() {
		// eslint-disable-next-line react/no-did-mount-set-state
		this.initiateSecurityKeyAuthentication();
	}

	initiateSecurityKeyAuthentication = () => {
		const { onSuccess } = this.props;

		this.props
			.loginUserWithSecurityKey()
			.then( () => onSuccess() )
			.catch( () => {
				this.setState( { showError: true } );
			} );
	};

	render() {
		const { translate } = this.props;

		return (
			<form onSubmit={ event => event.preventDefault() }>
				<Card compact className="two-factor-authentication__verification-code-form">
					<p>
						{ translate( '{{strong}}Use your security key to finish logging in.{{/strong}}', {
							components: {
								strong: <strong />,
							},
						} ) }
					</p>
					<p>
						{ translate(
							'Insert your security key into your USB port. Then tap the button or gold disc.'
						) }
					</p>
					{ this.state.showError && (
						<FormButton primary onClick={ this.initiateSecurityKeyAuthentication }>
							{ translate( 'Retry' ) }
						</FormButton>
					) }
				</Card>

				<TwoFactorActions twoFactorAuthType={ 'u2f' } />
			</form>
		);
	}
}

export default connect(
	null,
	{
		formUpdate,
		loginUserWithSecurityKey,
		recordTracksEvent,
	}
)( localize( SecurityKeyForm ) );
