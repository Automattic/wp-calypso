import { Gridicon } from '@automattic/components';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormButton from 'calypso/components/forms/form-button';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';

import './style.scss';

const debug = debugFactory( 'calypso:me:security:2fa-initial-setup' );

class Security2faInitialSetup extends Component {
	static displayName = 'Security2faInitialSetup';

	static propTypes = {
		onSuccess: PropTypes.func.isRequired,
	};

	state = {
		authMethod: 'app-based',
	};

	componentDidMount() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	}

	setAuth = ( event ) => this.setState( { authMethod: event.currentTarget.value } );

	render() {
		return (
			<div>
				<p>
					{ this.props.translate(
						'Two-Step Authentication adds an extra layer ' +
							'of security to your account. Once enabled, logging in to ' +
							'WordPress.com will require you to enter a unique passcode ' +
							'generated by an app on your mobile device or sent via text ' +
							'message, in addition to your username and password.'
					) }
				</p>

				<FormFieldset>
					<FormRadio
						id="app-auth"
						name="auth_method"
						value="app-based"
						defaultChecked
						onChange={ this.setAuth }
					/>
					<FormLabel htmlFor="app-auth">
						<Gridicon icon="phone" />
						<span className="security-2fa-initial-setup__item-title">
							{ this.props.translate( 'Set up using an app', {
								comment: 'A label used during Two-Step setup.',
							} ) }
						</span>
					</FormLabel>
					<FormSettingExplanation>
						{ this.props.translate(
							'Use an application on your phone to get two-step authentication codes when you login.'
						) }
					</FormSettingExplanation>
				</FormFieldset>
				<FormFieldset>
					<FormRadio
						id="sms-auth"
						name="auth_method"
						value="sms-settings"
						onChange={ this.setAuth }
					/>
					<FormLabel htmlFor="sms-auth">
						<Gridicon icon="chat" />
						<span className="security-2fa-initial-setup__item-title">
							{ this.props.translate( 'Set up using SMS', {
								comment: 'A label used during Two-Step setup.',
							} ) }
						</span>
					</FormLabel>
					<FormSettingExplanation>
						{ this.props.translate(
							'WordPress.com will send you a SMS with a two-step authentication code when you log in.'
						) }
					</FormSettingExplanation>
				</FormFieldset>

				<FormButton
					onClick={ ( event ) => {
						gaRecordEvent( 'Me', 'Clicked On 2fa Get Started Button' );
						this.props.onSuccess( event, this.state.authMethod );
					} }
				>
					{ this.props.translate( 'Get Started' ) }
				</FormButton>
			</div>
		);
	}
}

export default localize( Security2faInitialSetup );
