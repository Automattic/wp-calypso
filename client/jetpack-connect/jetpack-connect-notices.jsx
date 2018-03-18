/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	ACTIVATE_FAILURE,
	ALREADY_CONNECTED,
	ALREADY_CONNECTED_BY_OTHER_USER,
	ALREADY_OWNED,
	DEFAULT_AUTHORIZE_ERROR,
	INSTALL_FAILURE,
	IS_DOT_COM,
	JETPACK_IS_DISCONNECTED,
	JETPACK_IS_VALID,
	LOGIN_FAILURE,
	NOT_ACTIVE_JETPACK,
	NOT_CONNECTED_JETPACK,
	NOT_EXISTS,
	NOT_JETPACK,
	NOT_WORDPRESS,
	OUTDATED_JETPACK,
	INVALID_PERMISSIONS,
	RETRY_AUTH,
	RETRYING_AUTH,
	SECRET_EXPIRED,
	USER_IS_ALREADY_CONNECTED_TO_SITE,
	WORDPRESS_DOT_COM,
} from './connection-notice-types';
import Notice from 'components/notice';
import { addQueryArgs } from 'lib/route';
import { getConnectingSite } from 'state/jetpack-connect/selectors';

export class JetpackConnectNotices extends Component {
	static propTypes = {
		// Supply a function that will be called for flow-ending error cases
		// instead of showing a notice.
		onTerminalError: PropTypes.func,
		noticeType: PropTypes.oneOf( [
			ACTIVATE_FAILURE,
			ALREADY_CONNECTED,
			ALREADY_CONNECTED_BY_OTHER_USER,
			ALREADY_OWNED,
			DEFAULT_AUTHORIZE_ERROR,
			INSTALL_FAILURE,
			IS_DOT_COM,
			LOGIN_FAILURE,
			JETPACK_IS_DISCONNECTED,
			JETPACK_IS_VALID,
			NOT_ACTIVE_JETPACK,
			NOT_CONNECTED_JETPACK,
			NOT_EXISTS,
			NOT_JETPACK,
			NOT_WORDPRESS,
			OUTDATED_JETPACK,
			INVALID_PERMISSIONS,
			RETRY_AUTH,
			RETRYING_AUTH,
			SECRET_EXPIRED,
			USER_IS_ALREADY_CONNECTED_TO_SITE,
			WORDPRESS_DOT_COM,
		] ).isRequired,
		translate: PropTypes.func.isRequired,
		url: PropTypes.string,
	};

	getHelperUrl( helpType ) {
		const { siteToConnect } = this.props;

		// show full instructions
		if ( helpType === 'manual' ) {
			return addQueryArgs( { url: siteToConnect }, '/jetpack/connect/instructions' );
		}

		if ( helpType === 'support' ) {
			return 'https://jetpack.com/support/installing-jetpack/';
		}
	}

	trackManualInstallClick() {
		this.props.recordTracksEvent( 'calypso_remote_install_manual_install_click' );
	}

	trackSupportClick() {
		this.props.recordTracksEvent( 'calypso_remote_install_support_click' );
	}

	getNoticeValues() {
		const { noticeType, onDismissClick, translate } = this.props;

		const noticeValues = {
			icon: 'notice',
			status: 'is-error',
			text: translate( "That's not a valid url." ),
			showDismiss: false,
		};

		if ( onDismissClick ) {
			noticeValues.onDismissClick = onDismissClick;
			noticeValues.showDismiss = true;
		}

		switch ( noticeType ) {
			case ACTIVATE_FAILURE:
				noticeValues.text = translate(
					'We were unable to activate Jetpack. You can either {{manualInstall}}install Jetpack manually{{/manualInstall}} ' +
						'or {{support}}contact support{{/support}} for help.',
					{
						components: {
							manualInstall: (
								<a
									href={ this.getHelperUrl( 'manual' ) }
									onClick={ this.trackManualInstallClick }
								/>
							),
							support: (
								<a href={ this.getHelperUrl( 'support' ) } onClick={ this.trackSupportClick } />
							),
						},
					}
				);
				return noticeValues;

			case NOT_EXISTS:
				return noticeValues;

			case IS_DOT_COM:
				noticeValues.icon = 'block';
				noticeValues.text = translate(
					"That's a WordPress.com site, so you don't need to connect it."
				);
				return noticeValues;

			case NOT_WORDPRESS:
				noticeValues.icon = 'block';
				noticeValues.text = translate( "That's not a WordPress site." );
				return noticeValues;

			case NOT_ACTIVE_JETPACK:
				// in use in remote install, which automatically redirects to install
				return null;

			case OUTDATED_JETPACK:
				noticeValues.icon = 'block';
				noticeValues.text = translate( 'You must update Jetpack before connecting.' );
				return noticeValues;

			case INVALID_PERMISSIONS:
				noticeValues.text = translate( 'User has no permissions to install plugins.' );
				return noticeValues;

			case JETPACK_IS_DISCONNECTED:
				noticeValues.icon = 'link-break';
				noticeValues.text = translate( 'Jetpack is currently disconnected.' );
				return noticeValues;

			case JETPACK_IS_VALID:
				noticeValues.status = 'is-success';
				noticeValues.icon = 'plugins';
				noticeValues.text = translate( 'Jetpack is connected.' );
				return noticeValues;

			case LOGIN_FAILURE:
				noticeValues.text = translate(
					'Invalid credentials. ' +
						'Try again, {{manualInstall}}install Jetpack manually{{/manualInstall}} ' +
						'or {{support}}contact support{{/support}} for help.',
					{
						components: {
							manualInstall: (
								<a
									href={ this.getHelperUrl( 'manual' ) }
									onClick={ this.trackManualInstallClick }
								/>
							),
							support: (
								<a href={ this.getHelperUrl( 'support' ) } onClick={ this.trackSupportClick } />
							),
						},
					}
				);
				return noticeValues;

			case INSTALL_FAILURE:
				noticeValues.text = translate(
					'We were unable to install Jetpack. You can either {{manualInstall}}install Jetpack manually{{/manualInstall}} ' +
						'or {{support}}contact support{{/support}} for help.',
					{
						components: {
							manualInstall: (
								<a
									href={ this.getHelperUrl( 'manual' ) }
									onClick={ this.trackManualInstallClick }
								/>
							),
							support: (
								<a href={ this.getHelperUrl( 'support' ) } onClick={ this.trackSupportClick } />
							),
						},
					}
				);
				return noticeValues;

			case NOT_JETPACK:
				// Not notice required, we will move on to installation
				return null;

			case WORDPRESS_DOT_COM:
				noticeValues.text = translate( "Oops, that's us." );
				noticeValues.status = 'is-warning';
				noticeValues.icon = 'status';
				return noticeValues;

			case RETRYING_AUTH:
				noticeValues.text = translate(
					'Error authorizing. Page is refreshing for another attempt.'
				);
				noticeValues.status = 'is-warning';
				noticeValues.icon = 'notice';
				noticeValues.userCanRetry = true;
				return noticeValues;

			case RETRY_AUTH:
				noticeValues.text = translate(
					'In some cases, authorization can take a few attempts. Please try again.'
				);
				noticeValues.status = 'is-warning';
				noticeValues.icon = 'notice';
				noticeValues.userCanRetry = true;
				return noticeValues;

			case SECRET_EXPIRED:
				noticeValues.text = translate( "Oops, that took a while. You'll have to try again." );
				noticeValues.status = 'is-error';
				noticeValues.icon = 'notice';
				return noticeValues;

			case DEFAULT_AUTHORIZE_ERROR:
				noticeValues.text = translate(
					'Error authorizing your site. Please {{link}}contact support{{/link}}.',
					{
						components: {
							link: (
								<a
									href="https://jetpack.com/contact-support"
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					}
				);
				noticeValues.status = 'is-error';
				noticeValues.icon = 'notice';
				return noticeValues;

			case ALREADY_CONNECTED_BY_OTHER_USER:
				noticeValues.text = translate(
					'This site is already connected to a different WordPress.com user, ' +
						'you need to disconnect that user before you can connect another.'
				);
				noticeValues.status = 'is-warning';
				noticeValues.icon = 'notice';
				return noticeValues;

			case USER_IS_ALREADY_CONNECTED_TO_SITE:
				noticeValues.text = translate(
					'This WordPress.com account is already connected to another user on this site. ' +
						'Please login to another WordPress.com account to complete the connection.'
				);
				noticeValues.status = 'is-warning';
				noticeValues.icon = 'notice';
				return noticeValues;
		}
	}

	componentDidUpdate() {
		if ( this.errorIsTerminal() && this.props.onTerminalError ) {
			this.props.onTerminalError( this.props.noticeType );
		}
	}

	componentDidMount() {
		if ( this.errorIsTerminal() && this.props.onTerminalError ) {
			this.props.onTerminalError( this.props.noticeType );
		}
	}

	errorIsTerminal() {
		const notice = this.getNoticeValues();
		return notice && ! notice.userCanRetry;
	}

	render() {
		const noticeValues = this.getNoticeValues();
		if ( this.errorIsTerminal() && this.props.onTerminalError ) {
			return null;
		}
		if ( noticeValues ) {
			return (
				<div className="jetpack-connect__notices-container">
					<Notice { ...noticeValues } />
				</div>
			);
		}
		return null;
	}
}
export default connect( state => {
	const jetpackConnectSite = getConnectingSite( state );
	const siteToConnect = jetpackConnectSite.url;
	return {
		siteToConnect,
	};
} )( localize( JetpackConnectNotices ) );
