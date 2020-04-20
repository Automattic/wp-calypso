/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:me:security:2fa-initial-setup' );

/**
 * Internal dependencies
 */
import FormButton from 'components/forms/form-button';
import { gaRecordEvent } from 'lib/analytics/ga';

class Security2faInitialSetup extends React.Component {
	static displayName = 'Security2faInitialSetup';

	static propTypes = {
		onSuccess: PropTypes.func.isRequired,
	};

	componentDidMount() {
		debug( this.constructor.displayName + ' React component is mounted.' );
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component will unmount.' );
	}

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

				<FormButton
					onClick={ function ( event ) {
						gaRecordEvent( 'Me', 'Clicked On 2fa Get Started Button' );
						this.props.onSuccess( event );
					}.bind( this ) }
				>
					{ this.props.translate( 'Get Started' ) }
				</FormButton>
			</div>
		);
	}
}

export default localize( Security2faInitialSetup );
