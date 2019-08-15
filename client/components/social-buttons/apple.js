/**
 * External dependencies
 */
import config from 'config';
import classNames from 'classnames';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadScript } from '@automattic/load-script';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isFormDisabled } from 'state/login/selectors';

/**
 * Style dependencies
 */
import './style.scss';
import AppleIcon from 'components/social-icons/apple';

class AppleLoginButton extends Component {
	static propTypes = {
		isFormDisabled: PropTypes.bool,
		clientId: PropTypes.string.isRequired,
		redirectUri: PropTypes.string.isRequired,
	};

	componentDidMount() {
		this.initialize();
	}

	async loadDependency() {
		if ( ! window.AppleID ) {
			await loadScript(
				'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'
			);
		}

		return window.AppleID;
	}

	initialize() {
		if ( this.initialized ) {
			return this.initialized;
		}

		if ( ! config.isEnabled( 'sign-in-with-apple' ) ) {
			return;
		}

		this.setState( { error: '' } );

		this.initialized = this.loadDependency()
			.then( AppleID =>
				AppleID.auth.init( {
					clientId: this.props.clientId,
					scope: 'name email',
					redirectURI: this.props.redirectUri,
					state: '1',
				} )
			)
			.catch( error => {
				this.initialized = null;

				return Promise.reject( error );
			} );

		return this.initialized;
	}

	render() {
		const { isFormDisabled } = this.props;

		if ( ! config.isEnabled( 'sign-in-with-apple' ) ) {
			return null;
		}

		return (
			<button
				className={ classNames( 'social-buttons__button button', { disabled: isFormDisabled } ) }
			>
				<AppleIcon isDisabled={ isFormDisabled } />

				<span className="social-buttons__service-name">
					{ this.props.translate( 'Sign in with %(service)s', {
						args: { service: 'Apple' },
						comment:
							'%(service)s is the name of a third-party provider, e.g. "Google", "Facebook", "Apple" ...',
					} ) }
				</span>
			</button>
		);
	}
}

export default connect(
	state => ( {
		isFormDisabled: isFormDisabled( state ),
	} ),
	null
)( localize( AppleLoginButton ) );
