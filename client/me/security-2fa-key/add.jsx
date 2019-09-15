/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { errorNotice, warningNotice } from 'state/notices/actions';
import webauthn from 'lib/webauthn';
import Spinner from 'components/spinner';
import Security2faKeyAddName from './name';

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

	registerKey = securityKeyName => {
		this.setState( { securityKeyName } );
		webauthn
			.register( securityKeyName )
			.then( data => {
				debug( 'registered key with data', data );
				this.keyRegistered();
			} )
			.catch( e => {
				this.handleError( e );
			} );
	};

	handleError = e => {
		if ( 'Canceled' === e.error ) {
			dispatch(
				warningNotice( e.message, {
					showDismiss: true,
					isPersistent: true,
					duration: 5000,
				} )
			);
		} else {
			dispatch( errorNotice( e.message ) );
		}
		this.props.onCancel();
	};

	keyRegistered = () => {
		this.props.onRegister();
	};

	render() {
		return (
			<Card>
				{ ! this.state.securityKeyName && (
					<>
						<Security2faKeyAddName
							onNameSubmit={ this.registerKey }
							onCancel={ this.props.onCancel }
						/>
					</>
				) }
				{ this.state.securityKeyName && (
					<>
						<div className="security-2fa-key__add-wait-for-key">
							<Spinner />
							<p>{ this.props.translate( 'Insert your USB key into your USB port.' ) }</p>
							<p>
								{ this.props.translate(
									'Then tap the button or gold disk on the security device'
								) }
							</p>
						</div>
					</>
				) }
			</Card>
		);
	}
}

export default localize( Security2faKeyAdd );
