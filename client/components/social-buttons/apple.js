/**
 * External dependencies
 */
import config from 'config';
import classNames from 'classnames';
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

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
		responseHandler: PropTypes.func.isRequired,
	};

	static defaultProps = {
		onClick: noop,
	};

	handleClick = event => {
		event.preventDefault();

		this.props.onClick( event );

		requestExternalAccess( connectUrl, this.props.responseHandler );
	};

	shouldBeDisabledOnThisPlatform() {
		const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
		// redirect flow will fix this
		if ( config.isEnabled( 'sign-in-with-apple/redirect' ) ) {
			return false;
		}
		// exception for Chrome user agent which contains "Safari"
		if ( userAgent.includes( 'Chrome' ) ) {
			return false;
		}
		// Disabled on Safari for iOS 13 and macOS Catalina, as those do not support the popup flow at the moment
		return (
			userAgent.includes( 'Safari' ) &&
			( userAgent.includes( 'Mac OS X 10_15' ) || userAgent.includes( 'iPhone OS 13' ) )
		);
	}

	render() {
		if ( ! config.isEnabled( 'sign-in-with-apple' ) || this.shouldBeDisabledOnThisPlatform() ) {
			return null;
		}

		const { children, isFormDisabled: isDisabled } = this.props;
		let customButton = null;

		if ( children ) {
			const childProps = {
				className: classNames( { disabled: isDisabled } ),
				onClick: this.handleClick,
			};

			customButton = React.cloneElement( children, childProps );
		}

		return (
			<Fragment>
				{ customButton ? (
					customButton
				) : (
					<button
						className={ classNames( 'social-buttons__button button', { disabled: isDisabled } ) }
						onClick={ this.handleClick }
					>
						<AppleIcon isDisabled={ isDisabled } />

						<span className="social-buttons__service-name">
							{ this.props.translate( 'Continue with %(service)s', {
								args: { service: 'Apple' },
								comment:
									'%(service)s is the name of a third-party authentication provider, e.g. "Google", "Facebook", "Apple" ...',
							} ) }
						</span>
					</button>
				) }
			</Fragment>
		);
	}
}

export default connect(
	state => ( {
		isFormDisabled: isFormDisabled( state ),
	} ),
	null
)( localize( AppleLoginButton ) );
