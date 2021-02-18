/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { identity, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card, Button } from '@automattic/components';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const WINDOWS_LINK = 'https://apps.wordpress.com/d/windows?ref=getapps';
const MAC_LINK = 'https://apps.wordpress.com/d/osx?ref=getapps';
const LINUX_TAR_LINK = 'https://apps.wordpress.com/d/linux?ref=getapps';
const LINUX_DEB_LINK = 'https://apps.wordpress.com/d/linux-deb?ref=getapps';

class DesktopDownloadCard extends Component {
	static propTypes = {
		translate: PropTypes.func,
		trackWindowsClick: PropTypes.func,
		trackMacClick: PropTypes.func,
		trackLinuxTarClick: PropTypes.func,
		trackLinuxDebClick: PropTypes.func,
	};

	static defaultProps = {
		translate: identity,
		trackWindowsClick: noop,
		trackMacClick: noop,
		trackLinuxTarClick: noop,
		trackLinuxDebClick: noop,
	};

	getDescription( platform ) {
		const { translate } = this.props;
		switch ( platform ) {
			case 'MacIntel':
			case 'Linux i686':
			case 'Linux i686 on x86_64':
				return translate( 'A desktop app that gives WordPress a permanent home in your dock.' );
			default:
				return translate( 'A desktop app that gives WordPress a permanent home in your taskbar.' );
		}
	}

	getRequirementsText( platform ) {
		const { translate } = this.props;
		switch ( platform ) {
			case 'MacIntel':
				return translate( 'Requires Mac OS X 10.11+. ' );
			case 'Linux i686':
			case 'Linux i686 on x86_64':
				return translate( 'Requires a 64-bit kernel. ' );
			default:
				return translate( 'Requires Windows 7+. ' );
		}
	}

	getTranslateComponents( platform ) {
		switch ( platform ) {
			case 'MacIntel':
				return {
					firstAvailableLink: this.getLinkAnchorTag( WINDOWS_LINK ),
					secondAvailableLink: this.getLinkAnchorTag( LINUX_TAR_LINK ),
					thirdAvailableLink: this.getLinkAnchorTag( LINUX_DEB_LINK ),
				};
			case 'Linux i686':
			case 'Linux i686 on x86_64':
				return {
					firstAvailableLink: this.getLinkAnchorTag( LINUX_DEB_LINK ),
					secondAvailableLink: this.getLinkAnchorTag( WINDOWS_LINK ),
					thirdAvailableLink: this.getLinkAnchorTag( MAC_LINK ),
				};
			default:
				return {
					firstAvailableLink: this.getLinkAnchorTag( MAC_LINK ),
					secondAvailableLink: this.getLinkAnchorTag( LINUX_TAR_LINK ),
					thirdAvailableLink: this.getLinkAnchorTag( LINUX_DEB_LINK ),
				};
		}
	}

	getAlsoAvailableText( platform ) {
		const { translate } = this.props;
		switch ( platform ) {
			case 'MacIntel':
				return translate(
					'Also available for: ' +
						'{{firstAvailableLink}}Windows{{/firstAvailableLink}}, ' +
						'{{secondAvailableLink}}Linux (.tar.gz){{/secondAvailableLink}}, ' +
						'{{thirdAvailableLink}}Linux (.deb){{/thirdAvailableLink}}.',
					{ components: this.getTranslateComponents( platform ) }
				);
			case 'Linux i686':
			case 'Linux i686 on x86_64':
				return translate(
					'Also available for: ' +
						'{{firstAvailableLink}}Linux (.deb){{/firstAvailableLink}}, ' +
						'{{secondAvailableLink}}Windows{{/secondAvailableLink}}, ' +
						'{{thirdAvailableLink}}Mac{{/thirdAvailableLink}}.',
					{ components: this.getTranslateComponents( platform ) }
				);
			default:
				return translate(
					'Also available for: ' +
						'{{firstAvailableLink}}MacOS{{/firstAvailableLink}}, ' +
						'{{secondAvailableLink}}Linux (.tar.gz){{/secondAvailableLink}}, ' +
						'{{thirdAvailableLink}}Linux (.deb){{/thirdAvailableLink}}.',
					{ components: this.getTranslateComponents( platform ) }
				);
		}
	}

	getButtonClickHandler( platform ) {
		const { trackWindowsClick, trackMacClick, trackLinuxTarClick, trackLinuxDebClick } = this.props;

		switch ( platform ) {
			case 'MacIntel':
				return trackMacClick;
			case 'Linux i686':
				return trackLinuxTarClick;
			case 'Linux i686 on x86_64':
				return trackLinuxDebClick;
			default:
				return trackWindowsClick;
		}
	}

	getButtonLink( platform ) {
		switch ( platform ) {
			case 'MacIntel':
				return MAC_LINK;
			case 'Linux i686':
			case 'Linux i686 on x86_64':
				return LINUX_TAR_LINK;
			default:
				return WINDOWS_LINK;
		}
	}

	getCardTitle( platform ) {
		const { translate } = this.props;
		switch ( platform ) {
			case 'MacIntel':
				return translate( 'Desktop App for Mac' );
			case 'Linux i686':
			case 'Linux i686 on x86_64':
				return translate( 'Desktop App for Linux' );
			default:
				return translate( 'Desktop App for Windows' );
		}
	}

	getLinkAnchorTag( platformLink ) {
		const { trackWindowsClick, trackMacClick, trackLinuxTarClick, trackLinuxDebClick } = this.props;

		switch ( platformLink ) {
			case MAC_LINK:
				return <a href={ platformLink } onClick={ trackMacClick } />;
			case LINUX_TAR_LINK:
				return <a href={ platformLink } onClick={ trackLinuxTarClick } />;
			case LINUX_DEB_LINK:
				return <a href={ platformLink } onClick={ trackLinuxDebClick } />;
			default:
				return <a href={ platformLink } onClick={ trackWindowsClick } />;
		}
	}

	render() {
		const { translate } = this.props;
		const platform =
			navigator.platform && navigator.platform.length > 0 ? navigator.platform : false;
		return (
			<Card className="get-apps__desktop">
				<div className="get-apps__card-text">
					<h3 className="get-apps__card-title">{ this.getCardTitle( platform ) }</h3>
					<p className="get-apps__description">{ this.getDescription( platform ) }</p>
					<p className="get-apps__also-available">
						{ this.getRequirementsText( platform ) }
						{ this.getAlsoAvailableText( platform ) }
					</p>
				</div>
				<Button
					className="get-apps__desktop-button"
					href={ this.getButtonLink( platform ) }
					onClick={ this.getButtonClickHandler( platform ) }
				>
					{ translate( 'Download' ) }
				</Button>
			</Card>
		);
	}
}

const mapDispatchToProps = {
	trackWindowsClick: () => recordTracksEvent( 'calypso_app_download_windows_click' ),
	trackMacClick: () => recordTracksEvent( 'calypso_app_download_mac_click' ),
	trackLinuxTarClick: () => recordTracksEvent( 'calypso_app_download_linux_tar_click' ),
	trackLinuxDebClick: () => recordTracksEvent( 'calypso_app_download_linux_deb_click' ),
};

export default connect( null, mapDispatchToProps )( localize( DesktopDownloadCard ) );
