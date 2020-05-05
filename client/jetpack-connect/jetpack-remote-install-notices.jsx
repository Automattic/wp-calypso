/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import FormattedHeader from 'components/formatted-header';
import { addQueryArgs } from 'lib/route';
import { getConnectingSite } from 'state/jetpack-connect/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import {
	ACTIVATION_FAILURE,
	ACTIVATION_RESPONSE_ERROR,
	INSTALL_RESPONSE_ERROR,
	INVALID_PERMISSIONS,
	UNKNOWN_REMOTE_INSTALL_ERROR,
} from './connection-notice-types';

export class JetpackRemoteInstallNotices extends Component {
	static propTypes = {
		noticeType: PropTypes.oneOf( [
			ACTIVATION_FAILURE,
			ACTIVATION_RESPONSE_ERROR,
			INSTALL_RESPONSE_ERROR,
			INVALID_PERMISSIONS,
			UNKNOWN_REMOTE_INSTALL_ERROR,
		] ).isRequired,
		translate: PropTypes.func.isRequired,
		url: PropTypes.string,
	};

	trackManualInstallClick = ( noticeType ) => () => {
		this.props.recordTracksEvent( 'calypso_remote_install_manual_install_click', {
			notice_type: noticeType,
		} );
	};

	renderNotice() {
		const { noticeType, siteToConnect, translate } = this.props;
		// default values for INSTALL_RESPONSE_ERROR,
		let header = translate( 'Try Installing Manually' );
		let subheader = translate(
			"We were unable to install Jetpack. Don't worry—you can either install Jetpack manually or contact support for help."
		);
		let buttonLabel = translate( 'Install Jetpack manually' );
		let noticeImage = '/calypso/images/illustrations/customizeTheme.svg';
		let redirectTo = addQueryArgs( { url: siteToConnect }, '/jetpack/connect/instructions' );

		switch ( noticeType ) {
			case ACTIVATION_RESPONSE_ERROR:
				subheader = translate(
					"We were unable to activate Jetpack. Don't worry—you can either install Jetpack manually or contact support for help."
				);
				break;

			case ACTIVATION_FAILURE:
				header = translate( 'WordPress version update needed' );
				subheader = translate(
					'We were unable to install Jetpack because you are running an oudated version ' +
						'of WordPress. Jetpack needs WordPress version 4.7 or higher. ' +
						'Please update to the latest version by clicking below.'
				);
				noticeImage = '/calypso/images/illustrations/install-button.svg';
				buttonLabel = translate( 'Update WordPress now' );
				redirectTo = siteToConnect + '/wp-admin/update-core.php';
				break;

			case INVALID_PERMISSIONS:
				header = translate( 'Contact your site Administrator' );
				subheader = translate(
					'We were unable to install Jetpack because you do not have permissions ' +
						"to install plugins. Please contact your site's Administrator to " +
						'continue with installing Jetpack or try installing Jetpack manually.'
				);
				noticeImage = '/calypso/images/illustrations/almost-there.svg';
				break;

			case UNKNOWN_REMOTE_INSTALL_ERROR:
				subheader = translate( 'We were unable to install Jetpack because something went wrong.' );
		}
		return (
			<Fragment>
				<FormattedHeader headerText={ header } subHeaderText={ subheader } />
				<Card className="jetpack-connect__site-url-input-container">
					<img className="jetpack-connect__notices-image" src={ noticeImage } alt="" />
					<Button
						className="jetpack-connect__connect-button"
						primary
						href={ redirectTo }
						onClick={ this.trackManualInstallClick( noticeType ) }
					>
						{ buttonLabel }
					</Button>
				</Card>
			</Fragment>
		);
	}

	render() {
		return <div>{ this.renderNotice() }</div>;
	}
}

export default connect(
	( state ) => {
		const jetpackConnectSite = getConnectingSite( state );
		const siteData = jetpackConnectSite.data || {};
		return {
			siteToConnect: siteData.urlAfterRedirects || jetpackConnectSite.url,
		};
	},
	{ recordTracksEvent }
)( localize( JetpackRemoteInstallNotices ) );
