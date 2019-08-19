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
import requestExternalAccess from 'lib/sharing';

/**
 * Style dependencies
 */
import './style.scss';
import AppleIcon from 'components/social-icons/apple';

const connectUrl =
	'https://public-api.wordpress.com/connect/?magic=keyring&service=apple&action=request&for=connect';

class AppleLoginButton extends Component {
	static propTypes = {
		isFormDisabled: PropTypes.bool,
		clientId: PropTypes.string.isRequired,
		redirectUri: PropTypes.string.isRequired,
	};

	state = {
		isDisabled: true,
	};

	constructor( props ) {
		super( props );

		this.initialized = null;
	}

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
			.then( () => {
				this.setState( { isDisabled: false } );
			} )
			.catch( error => {
				this.initialized = null;

				return Promise.reject( error );
			} );

		return this.initialized;
	}

	handleClick = event => {
		event.preventDefault();

		if ( this.state.isDisabled ) {
			return;
		}

		requestExternalAccess( connectUrl, this.props.responseHandler );
	};

	render() {
		const isDisabled = Boolean( this.state.isDisabled || this.props.isFormDisabled );

		if ( ! config.isEnabled( 'sign-in-with-apple' ) ) {
			return null;
		}

		return (
			<button
				className={ classNames( 'social-buttons__button button', { disabled: isDisabled } ) }
				onClick={ this.handleClick }
			>
				<AppleIcon isDisabled={ isDisabled } />

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
