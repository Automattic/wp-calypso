import { Gridicon } from '@automattic/components';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import FormButton from 'calypso/components/forms/form-button';
import FormLabel from 'calypso/components/forms/form-label';
import FormRadio from 'calypso/components/forms/form-radio';
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

				<p>
					<FormLabel>
						<FormRadio
							name="auth_method"
							value="app-based"
							defaultChecked={ true }
							onChange={ this.setAuth }
						/>
						<Gridicon icon="phone" />
						<span className="security-2fa-initial-setup__item-title">
							{ this.props.translate( 'Set up using an app' ) }
						</span>
						<span className="security-2fa-initial-setup__description">
							{ this.props.translate(
								'Use an application on your phone to get two-step authentication codes when you login.'
							) }
						</span>
					</FormLabel>
				</p>
				<p>
					<FormLabel className="security-2fa-initial-setup__label">
						<FormRadio name="auth_method" value="sms-settings" onChange={ this.setAuth } />
						<Gridicon icon="chat" />
						<span className="security-2fa-initial-setup__item-title">
							{ this.props.translate( 'Set up using SMS' ) }
						</span>
						<span className="security-2fa-initial-setup__description">
							{ this.props.translate(
								'WordPress.com will send you a SMS with a two-step authentication code when you log in.'
							) }
						</span>
					</FormLabel>
				</p>

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
