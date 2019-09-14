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
import Button from 'components/button';
import Card from 'components/card';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import webauthn from 'lib/webauthn';
import Spinner from 'components/spinner';

const debug = debugFactory( 'calypso:me:security-2fa-key' );

class Security2faKeyAdd extends React.Component {
	static propTypes = {
		onRegister: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		registerRequests: PropTypes.object.isRequired,
	};

	state = {
		error: false,
	};

	componentDidMount = () => {
		this.registerKey();
	};

	registerKey = () => {
		this.setState( { error: false } );
		webauthn
			.register()
			.then( data => {
				debug( 'registered key with data', data );
				this.keyRegistered();
			} )
			.catch( error => {
				this.setState( { error } );
			} );
	};

	keyRegistered = () => {
		this.props.onRegister();
	};

	render() {
		return (
			<Card>
				{ ! this.state.error && (
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
						<div className="security-2fa-key__add-button-container">
							<Button onClick={ this.props.onCancel }>Cancel</Button>
						</div>
					</>
				) }
				{ this.state.error && (
					<Notice
						status={ this.state.error.error === 'Canceled' ? 'is-warning' : 'is-error' }
						className="security-2fa-key__error-notice"
						onDismissClick={ this.props.onCancel }
						text={ this.state.error.message }
					>
						<NoticeAction onClick={ this.registerKey }>
							{ this.props.translate( 'Retry' ) }
						</NoticeAction>
					</Notice>
				) }
			</Card>
		);
	}
}

export default localize( Security2faKeyAdd );
