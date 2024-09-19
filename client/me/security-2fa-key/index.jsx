import { Button, Card, Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { Component } from 'react';
import { connect } from 'react-redux';
import InlineSupportLink from 'calypso/components/inline-support-link';
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
		errorMessage: null,
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
		this.setState( { addingKey: true, errorMessage: null } );
	};

	addKeyRegister = () => {
		this.getKeysFromServer();
	};

	deleteKeyRegister = ( keyData ) => {
		const { translate } = this.props;
		this.setState( { errorMessage: false } );
		wpcom.req.get( '/me/two-step/security-key/delete', { credential_id: keyData.id }, ( err ) => {
			if ( null === err ) {
				this.getKeysFromServer();
			} else {
				const errorMessage =
					'invalid_operation' === err.error
						? translate(
								`Unable to delete the last WordPress.com security key while enhanced account security is active. Deleting it may result in losing access to your account. If you still want to remove it, please disable enhanced account security.`
						  )
						: translate( 'The key could not be deleted. Please try again later.' );
				this.setState( {
					errorMessage,
				} );
			}
		} );
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
		const {
			isEnabled,
			addingKey,
			isBrowserSupported,
			errorMessage,
			security2faKeys,
			security2faChallenge,
		} = this.state;

		if ( ! isEnabled ) {
			return null;
		}

		return (
			<div className="security-2fa-key">
				<SectionHeader label={ translate( 'Security key' ) }>
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
						registerRequests={ security2faChallenge }
					/>
				) }
				{ errorMessage && (
					<Notice
						status="is-error"
						icon="notice"
						text={ errorMessage }
						onDismissClick={ () => this.setState( { errorMessage: null } ) }
					/>
				) }
				{ ! addingKey && ! security2faKeys.length && (
					<Card>
						{ isBrowserSupported && (
							<p>
								{ translate(
									'Security keys offer a more robust form of two-step authentication. Your security key may be a physical device, or you can use passkey support built into your browser.'
								) }{ ' ' }
								<InlineSupportLink
									showIcon={ false }
									supportContext="two-step-authentication-security-key"
								>
									{ translate( 'Learn more' ) }
								</InlineSupportLink>
							</p>
						) }
						{ ! isBrowserSupported && (
							<p>
								{ translate(
									"Your browser doesn't support the FIDO2 security key standard yet. To use a second factor security key to sign in please try a supported browser like Chrome, Safari, or Firefox."
								) }
							</p>
						) }
					</Card>
				) }
				{ ! addingKey && !! security2faKeys.length && (
					<Security2faKeyList
						securityKeys={ security2faKeys }
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
