/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormattedHeader from 'components/formatted-header';
import { addQueryArgs } from 'lib/route';
import { getConnectingSite } from 'state/jetpack-connect/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import {
	ACTIVATION_FAILURE,
	ACTIVATION_RESPONSE_ERROR,
	INSTALL_RESPONSE_ERROR,
	INVALID_PERMISSIONS,
} from './connection-notice-types';

export class JetpackRemoteInstallNotices extends Component {
	static propTypes = {
		noticeType: PropTypes.oneOf( [
			ACTIVATION_FAILURE,
			ACTIVATION_RESPONSE_ERROR,
			INSTALL_RESPONSE_ERROR,
			INVALID_PERMISSIONS,
		] ).isRequired,
		translate: PropTypes.func.isRequired,
		url: PropTypes.string,
	};

	trackManualInstallClick = () => {
		this.props.recordTracksEvent( 'calypso_remote_install_manual_install_click' );
	};

	renderNotice() {
		const { noticeType, siteToConnect, translate } = this.props;
		// default values for ACTIVATION_RESPONSE_ERROR, INSTALL_RESPONSE_ERROR,
		let header = translate( 'Add your website credentials' );
		let subheader = translate(
			"We were unable to activate Jetpack. Don't worry- you can either install Jetpack manually or contact support for help."
		);
		let buttonLabel = translate( 'Install Jetpack manually' );
		let noticeImage = <img src="/calypso/images/illustrations/customizeTheme.svg" alt="" />;
		let redirectTo = addQueryArgs( { url: siteToConnect }, '/jetpack/connect/instructions' );

		switch ( noticeType ) {
			case ACTIVATION_FAILURE:
				header = translate( 'WordPress version update needed' );
				subheader = translate(
					'We were unable to install Jetpack because you are running an oudated version ' +
						'of WordPress. Jetpack needs WordPress version 4.7 or higher. ' +
						'Please update to the latest version by clicking below.'
				);
				noticeImage = <img src="/calypso/images/illustrations/install-button.svg" alt="" />;
				buttonLabel = translate( 'Update WordPress now' );
				redirectTo = siteToConnect + '/wp-admin/update-core.php';

			case INVALID_PERMISSIONS:
				header = translate( 'Contact your site Administrator' );
				subheader = translate(
					'We were unable to install Jetpack because you do not have permissions ' +
						"to install plugins. Please contact your site's Administrator to " +
						'continue with installing Jetpack or try installing Jetpack manually.'
				);
				noticeImage = <img src="/calypso/images/illustrations/almost-there.svg" alt="" />;
		}
		return (
			<Fragment>
				<FormattedHeader headerText={ header } subHeaderText={ subheader } />
				<Card className="jetpack-connect__site-url-input-container">
					<div className="jetpack-connect__notices-image">{ noticeImage }</div>
					<Button
						className="jetpack-connect__connect-button"
						primary
						href={ redirectTo }
						onClick={ this.trackManualInstallClick() }
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
	state => {
		const jetpackConnectSite = getConnectingSite( state );
		return {
			siteToConnect: get( jetpackConnectSite, 'url', '' ),
		};
	},
	{ recordTracksEvent }
)( localize( JetpackRemoteInstallNotices ) );
