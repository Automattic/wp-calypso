/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { errorNotice, warningNotice, successNotice } from 'state/notices/actions';
import { registerSecurityKey } from 'lib/webauthn';
import Security2faKeyAddName from './name';
import WaitForKey from './wait-for-key';

const debug = debugFactory( 'calypso:me:security-2fa-key' );

class Security2faKeyAdd extends React.Component {
	static propTypes = {
		onRegister: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		registerRequests: PropTypes.object.isRequired,
	};

	state = {
		securityKeyName: '',
	};

	registerKey = ( securityKeyName ) => {
		this.setState( { securityKeyName } );
		registerSecurityKey( securityKeyName )
			.then( ( data ) => {
				debug( 'registered key with data', data );
				this.keyRegistered();
			} )
			.catch( ( e ) => {
				this.handleError( e );
			} );
	};

	handleError = ( e ) => {
		if ( 'Canceled' === e.error ) {
			this.props.warningNotice( e.message, {
				showDismiss: true,
				isPersistent: true,
				duration: 5000,
			} );
		} else {
			this.props.errorNotice( e.message );
		}
		this.props.onCancel();
	};

	keyRegistered = () => {
		this.props.successNotice(
			this.props.translate( 'Security key has been successfully registered.' ),
			{
				showDismiss: true,
				isPersistent: true,
				duration: 5000,
			}
		);
		this.props.onRegister();
	};

	render() {
		return (
			<Card>
				{ ! this.state.securityKeyName && (
					<Security2faKeyAddName
						onNameSubmit={ this.registerKey }
						onCancel={ this.props.onCancel }
					/>
				) }
				{ this.state.securityKeyName && <WaitForKey /> }
			</Card>
		);
	}
}

export default connect( null, {
	errorNotice,
	warningNotice,
	successNotice,
} )( localize( Security2faKeyAdd ) );
