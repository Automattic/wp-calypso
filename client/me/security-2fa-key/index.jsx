import { Button, Card, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { get } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import SectionHeader from 'calypso/components/section-header';
import { isWebAuthnSupported } from 'calypso/lib/webauthn';
import wpcom from 'calypso/lib/wp';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import Security2faKeyAdd from './add';
import Security2faKeyList from './list';

class Security2faKey extends Component {
	state = {
		isEnabled: false,
		addingKey: false,
		isBrowserSupported: isWebAuthnSupported(),
		errorMessage: false,
		security2faChallenge: {},
		security2faKeys: [],
	};

	componentDidMount = () => {
		this.getKeysFromServer();
	};

	getClickHandler = ( action, callback ) => {
		return ( event ) => {
			this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );

			if ( callback ) {
				callback( event );
			}
		};
	};

	addKeyStart = ( event ) => {
		event.preventDefault();
		this.setState( { addingKey: true } );
	};

	addKeyRegister = () => {
		this.getKeysFromServer();
	};

	deleteKeyRegister = ( keyData ) => {
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
		if ( null === err ) {
			this.setState( {
				isEnabled: true,
				addingKey: false,
				security2faKeys: get( data, 'registrations', [] ),
			} );
		}
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
		const { isEnabled, addingKey, isBrowserSupported, errorMessage, security2faKeys } = this.state;

		if ( ! isEnabled ) {
			return null;
		}

		return (
			<div className="security-2fa-key">
				<SectionHeader label={ translate( 'Security Key' ) }>
					{ ! addingKey && isBrowserSupported && (
						<Button
							compact
							onClick={ this.getClickHandler( 'Register New Key Button', this.addKeyStart ) }
						>
							{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
							<Gridicon icon="plus-small" size={ 16 } />
							{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
							{ translate( 'Register key' ) }
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
						{ isBrowserSupported && (
							<p>
								<>
									{ this.props.translate(
										'Security keys offer a more robust form of two-step authentication. Your security key may be a physical device, or you can use passkey support built into your browser.'
									) }{ ' ' }
									<InlineSupportLink
										showIcon={ false }
										supportContext="two-step-authentication-security-key"
									>
										{ translate( 'Learn more' ) }
									</InlineSupportLink>
								</>
							</p>
						) }
						{ ! isBrowserSupported && (
							<p>
								{ this.props.translate(
									"Your browser doesn't support the FIDO2 security key standard yet. To use a second factor security key to sign in please try a supported browsers like Chrome, Safari, or Firefox."
								) }
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
			</div>
		);
	}
}

export default connect( null, {
	recordGoogleEvent,
} )( localize( Security2faKey ) );
