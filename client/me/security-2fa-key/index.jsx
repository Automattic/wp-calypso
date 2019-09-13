/**
 * External dependencies
 */
import Gridicon from 'components/gridicon';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';
import webauthn from 'lib/webauthn';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import Security2faKeyAdd from './add';
import Security2faKeyList from './list';
import { recordGoogleEvent } from 'state/analytics/actions';
import wpcom from 'lib/wp';
import Notice from 'components/notice';

class Security2faKey extends React.Component {
	static initialState = Object.freeze( {
		addingKey: false,
		isBrowserSupported: true,
		errorMessage: false,
		security2faChallenge: {},
		security2faKeys: [],
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

	addKeyRegister = () => {
		this.getKeysFromServer();
	};

	deleteKeyRegister = keyData => {
		console.log( 'Register key: ', keyData ); //eslint-disable-line
		wpcom.req.get(
			'/me/two-step/security-key/delete',
			{ credential_id: keyData.id },
			this.getKeysFromServer
		);
	};

	addKeyCancel = () => {
		this.setState( { addingKey: false } );
	};

	keysFromServer = ( err, data ) => {
		this.setState( { addingKey: false, security2faKeys: get( data, 'registrations', [] ) } );
	};

	getChallenge = () => {
		wpcom.req.get( '/me/two-step/security-key/registration_challenge', {}, this.setChallenge );
	};

	setChallenge = ( error, data ) => {
		this.setState( { security2faChallenge: data } );
	};

	getKeysFromServer = () => {
		wpcom.req.get( '/me/two-step/security-key/get', {}, this.keysFromServer );
	};

	render() {
		const { translate } = this.props;
		const { addingKey, isBrowserSupported, errorMessage, security2faKeys } = this.state;
		return (
			<Fragment>
				<SectionHeader label={ translate( 'Security Key' ) }>
					{ ! addingKey && (
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
				{ addingKey && this.state.security2faChallenge && (
					<Security2faKeyAdd
						onRegister={ this.addKeyRegister }
						onCancel={ this.addKeyCancel }
						registerRequests={ this.state.security2faChallenge }
					/>
				) }
				{ errorMessage && <Notice status="is-error" icon="notice" text={ errorMessage } /> }
				{ ! addingKey && ! security2faKeys.length && (
					<Card>
						<p>Use a 2nd factor security key to sign in.</p>
						{ ! isBrowserSupported && (
							<p>
								Looks like you browser doesn't support the FIDO2 standard yet. Read more about the
								requirements for adding a key to your account.
							</p>
						) }
					</Card>
				) }
				{ ! addingKey && !! security2faKeys.length && (
					<Security2faKeyList
						securityKeys={ this.state.security2faKeys }
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
)( localize( Security2faKey ) );
