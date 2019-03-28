/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import webauthn from 'lib/webauthn';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import SecurityU2fKeyAdd from './add';
import SecurityU2fKeyList from './list';
import { recordGoogleEvent } from 'state/analytics/actions';
import wpcom from 'lib/wp';
import Notice from 'components/notice';
import { warningNotice, successNotice, removeNotice } from 'state/notices/actions';

function SecurityKeyErrorNotice( text ) {
	return <Notice status="is-error" icon="notice" />;
}

class SecurityU2fKey extends React.Component {
	static initialState = Object.freeze( {
		addingKey: false,
		isBrowserSupported: true,
		errorMessage: false,
		u2fChallenge: {},
		u2fKeys: [],
	} );

	state = this.constructor.initialState;

	componentDidMount = () => {
		this.getKeysFromServer();
		webauthn.isSupported().then( this.setSupported );
	};

	getClickHandler = ( action, callback ) => {
		return event => {
			this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );

			if ( callback ) {
				callback( event );
			}
		};
	};

	setSupported = supported => {
		this.setState( { isBrowserSupported: supported } );
	};

	addKeyStart = event => {
		event.preventDefault();
		this.setState( { addingKey: true } );
	};

	addKeyRegister = keyData => {
		console.log( keyData.clientData ); //eslint-disable-line
		const body = {
			client_data: keyData.clientData,
			key_handle: Math.random()
				.toString( 36 )
				.substring( 7 ),
			signature_data: keyData.registrationData,
		};
		wpcom.req.post(
			'/me/two-step/security-key/registration_validate',
			body,
			this.getKeysFromServer
		);
	};

	deleteKeyRegister = keyData => {
		console.log( 'Register key: ', keyData ); //eslint-disable-line
		wpcom.req.post(
			'/me/two-step/security-key/delete',
			{ handle: keyData.handle },
			this.getKeysFromServer
		);
	};

	addKeyCancel = err => {
		this.setState( { addingKey: false } );
	};

	keysFromServer = ( err, data ) => {
		this.setState( { u2fKeys: data.registrations } );
	};

	getChallenge = () => {
		wpcom.req.get( '/me/two-step/security-key/registration_challenge', {}, this.setChallenge );
	};

	setChallenge = ( error, data ) => {
		this.setState( { u2fChallenge: data } );
	};

	getKeysFromServer = () => {
		wpcom.req.get( '/me/two-step/security-key/get', {}, this.keysFromServer );
	};

	render() {
		const { translate } = this.props;
		const { addingKey, isBrowserSupported, errorMessage, u2fKeys } = this.state;
		//		const u2fKeys = [];
		return (
			<Fragment>
				<SectionHeader label={ translate( 'Security Key' ) }>
					{ ! addingKey && (
						//! u2fKeys.length &&
						<Button
							compact
							onClick={ this.getClickHandler( 'Register New Key Button', this.addKeyStart ) }
						>
							{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
							<Gridicon icon="plus-small" size={ 16 } />
							{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
							{ translate( 'Register Key' ) }
						</Button>
					) }
				</SectionHeader>
				{ addingKey &&
					this.state.u2fChallenge && (
						<SecurityU2fKeyAdd
							onRegister={ this.addKeyRegister }
							onCancel={ this.addKeyCancel }
							registerRequests={ this.state.u2fChallenge }
						/>
					) }
				{ errorMessage && <SecurityKeyErrorNotice text={ errorMessage } /> }
				{ ! addingKey &&
					! u2fKeys.length && (
						<Card>
							<p>Use a Universal 2nd Factor security key to sign in.</p>
							{ ! isBrowserSupported && (
								<p>
									Looks like you browser doesn't support the FIDO U2F standard yet. Read more about
									the requirements for adding a key to your account.
								</p>
							) }
						</Card>
					) }
				{ ! addingKey &&
					!! u2fKeys.length && (
						<SecurityU2fKeyList
							securityKeys={ this.state.u2fKeys }
							onDelete={ this.deleteKeyRegister }
						/>
					) }
			</Fragment>
		);
	}
}

export default connect(
	null,
	{
		recordGoogleEvent,
	}
)( localize( SecurityU2fKey ) );
