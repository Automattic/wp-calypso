import { Card, Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize, translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Apple from 'calypso/assets/images/icons/apple-logo.svg';
import DesktopAppLogo from 'calypso/assets/images/icons/desktop-app-logo.svg';
import Linux from 'calypso/assets/images/icons/linux-logo.svg';
import Windows from 'calypso/assets/images/icons/windows-logo.svg';
import SVGIcon from 'calypso/components/svg-icon';
import userAgent from 'calypso/lib/user-agent';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const WINDOWS_LINK = 'https://apps.wordpress.com/d/windows?ref=getapps';
const MAC_LINK = 'https://apps.wordpress.com/d/osx?ref=getapps';
const LINUX_TAR_LINK = 'https://apps.wordpress.com/d/linux?ref=getapps';
const LINUX_DEB_LINK = 'https://apps.wordpress.com/d/linux-deb?ref=getapps';
const noop = () => {};

class DesktopDownloadCard extends Component {
	static propTypes = {
		translate: PropTypes.func,
		trackWindowsClick: PropTypes.func,
		trackMacClick: PropTypes.func,
		trackLinuxTarClick: PropTypes.func,
		trackLinuxDebClick: PropTypes.func,
	};

	static defaultProps = {
		trackWindowsClick: noop,
		trackMacClick: noop,
		trackLinuxTarClick: noop,
		trackLinuxDebClick: noop,
	};

	getDescription( platform ) {
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

	getPlatformImage( platform ) {
		switch ( platform ) {
			case 'MacIntel':
			case MAC_LINK:
				return <SVGIcon aria-hidden="true" name="apple-logo" size="24" icon={ Apple } />;
			case 'Linux i686':
			case 'Linux i686 on x86_64':
			case LINUX_TAR_LINK:
			case LINUX_DEB_LINK:
				return <SVGIcon aria-hidden="true" name="linux-logo" size="24" icon={ Linux } />;
			case WINDOWS_LINK:
			default:
				return <SVGIcon aria-hidden="true" name="windows-logo" size="24" icon={ Windows } />;
		}
	}

	getTranslateComponents( platform ) {
		switch ( platform ) {
			case 'MacIntel':
				return {
					firstAvailableLink: this.getLinkAnchorTag( WINDOWS_LINK ),
					secondAvailableLink: this.getLinkAnchorTag( LINUX_TAR_LINK ),
					thirdAvailableLink: this.getLinkAnchorTag( LINUX_DEB_LINK ),
					firstAvailableIcon: this.getPlatformImage( WINDOWS_LINK ),
					secondAvailableIcon: this.getPlatformImage( LINUX_TAR_LINK ),
					thirdAvailableIcon: this.getPlatformImage( LINUX_DEB_LINK ),
				};
			case 'Linux i686':
			case 'Linux i686 on x86_64':
				return {
					firstAvailableLink: this.getLinkAnchorTag( LINUX_DEB_LINK ),
					secondAvailableLink: this.getLinkAnchorTag( WINDOWS_LINK ),
					thirdAvailableLink: this.getLinkAnchorTag( MAC_LINK ),
					firstAvailableIcon: this.getPlatformImage( LINUX_DEB_LINK ),
					secondAvailableIcon: this.getPlatformImage( WINDOWS_LINK ),
					thirdAvailableIcon: this.getPlatformImage( MAC_LINK ),
				};
			default:
				return {
					firstAvailableLink: this.getLinkAnchorTag( MAC_LINK ),
					secondAvailableLink: this.getLinkAnchorTag( LINUX_TAR_LINK ),
					thirdAvailableLink: this.getLinkAnchorTag( LINUX_DEB_LINK ),
					firstAvailableIcon: this.getPlatformImage( MAC_LINK ),
					secondAvailableIcon: this.getPlatformImage( LINUX_TAR_LINK ),
					thirdAvailableIcon: this.getPlatformImage( LINUX_DEB_LINK ),
				};
		}
	}

	getAlsoAvailableText( platform ) {
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

	getAlsoAvailableTextJetpack( platform ) {
		switch ( platform ) {
			case 'MacIntel':
				return translate(
					'{{firstAvailableLink}}{{firstAvailableIcon /}}Windows{{/firstAvailableLink}}' +
						'{{secondAvailableLink}} {{secondAvailableIcon /}} Linux (.tar.gz){{/secondAvailableLink}}' +
						'{{thirdAvailableLink}} {{thirdAvailableIcon /}} Linux (.deb){{/thirdAvailableLink}}',
					{ components: this.getTranslateComponents( platform ) }
				);
			case 'Linux i686':
			case 'Linux i686 on x86_64':
				return translate(
					'{{firstAvailableLink}}{{firstAvailableIcon /}}Linux (.deb){{/firstAvailableLink}}' +
						'{{secondAvailableLink}}{{secondAvailableIcon /}}Windows{{/secondAvailableLink}}' +
						'{{thirdAvailableLink}}{{thirdAvailableIcon /}}Mac{{/thirdAvailableLink}}',
					{ components: this.getTranslateComponents( platform ) }
				);
			default:
				return translate(
					'{{firstAvailableLink}}{{firstAvailableIcon /}}MacOS{{/firstAvailableLink}}' +
						'{{secondAvailableLink}}{{secondAvailableIcon /}}Linux (.tar.gz){{/secondAvailableLink}}' +
						'{{thirdAvailableLink}}{{thirdAvailableIcon /}}Linux (.deb){{/thirdAvailableLink}}',
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

	getButtonText( platform ) {
		switch ( platform ) {
			case 'MacIntel':
				return translate( 'Download for Mac (Intel)' );
			case 'Linux i686':
			case 'Linux i686 on x86_64':
				return translate( 'Download for Linux' );
			default:
				return translate( 'Download for Windows' );
		}
	}

	getCardTitle( platform ) {
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
				return (
					<a
						href={ localizeUrl( platformLink ) }
						onClick={ trackMacClick }
						className="get-apps__desktop-link"
					/>
				);
			case LINUX_TAR_LINK:
				return (
					<a
						href={ localizeUrl( platformLink ) }
						onClick={ trackLinuxTarClick }
						className="get-apps__desktop-link"
					/>
				);
			case LINUX_DEB_LINK:
				return (
					<a
						href={ localizeUrl( platformLink ) }
						onClick={ trackLinuxDebClick }
						className="get-apps__desktop-link"
					/>
				);
			default:
				return (
					<a
						href={ localizeUrl( platformLink ) }
						onClick={ trackWindowsClick }
						className="get-apps__desktop-link"
					/>
				);
		}
	}

	getMobileDeviceDownloadOptions() {
		return translate( 'Visit {{a}}desktop.wordpress.com{{/a}} on your desktop.', {
			components: {
				a: <a href="https://desktop.wordpress.com" className="get-apps__desktop-link" />,
			},
		} );
	}

	getDesktopDeviceDownloadOptions() {
		const platform =
			navigator.platform && navigator.platform.length > 0 ? navigator.platform : false;

		return (
			<>
				<Button
					className="get-apps__desktop-button"
					href={ localizeUrl( this.getButtonLink( platform ) ) }
					onClick={ this.getButtonClickHandler( platform ) }
				>
					{ this.getButtonText( platform ) }
				</Button>
				<div className="get-apps__requirements-wrapper">
					{ this.getPlatformImage( platform ) }
					<p className="get-apps__requirements-paragraph">
						{ this.getRequirementsText( platform ) }
					</p>
				</div>
				<div className="get-apps__also-available">
					<p>{ translate( 'Also available for:' ) }</p>
					<div className="get-apps__also-available-link-group">
						{ this.getAlsoAvailableTextJetpack( platform ) }
					</div>
				</div>
			</>
		);
	}

	getJetpackBrandedPanel() {
		const { isMobile } = userAgent;

		return (
			<div className="get-apps__card-text">
				<SVGIcon
					name="desktop-app-logo"
					aria-hidden="true"
					size="51"
					viewBox="0 0 50 51"
					icon={ DesktopAppLogo }
					classes="get-apps__desktop-icon"
				/>
				<h1 className="get-apps__card-title">{ translate( 'WordPress.com desktop app' ) }</h1>
				<p>
					{ translate(
						'The full WordPress.com experience packaged as an app for your laptop or desktop.'
					) }
				</p>
				<div className="get-apps__desktop-download-subpanel">
					{ isMobile
						? this.getMobileDeviceDownloadOptions()
						: this.getDesktopDeviceDownloadOptions() }
				</div>
			</div>
		);
	}

	render() {
		return <Card className="get-apps__desktop">{ this.getJetpackBrandedPanel() }</Card>;
	}
}

const mapDispatchToProps = {
	trackWindowsClick: () => recordTracksEvent( 'calypso_app_download_windows_click' ),
	trackMacClick: () => recordTracksEvent( 'calypso_app_download_mac_click' ),
	trackLinuxTarClick: () => recordTracksEvent( 'calypso_app_download_linux_tar_click' ),
	trackLinuxDebClick: () => recordTracksEvent( 'calypso_app_download_linux_deb_click' ),
};

export default connect( null, mapDispatchToProps )( localize( DesktopDownloadCard ) );
