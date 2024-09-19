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

const PLATFORM_MAC_SILICON = 'MacSilicon';

/* eslint-disable wpcalypso/i18n-unlocalized-url */
const WINDOWS_LINK = 'https://apps.wordpress.com/d/windows?ref=getapps';
const MAC_INTEL_LINK = 'https://apps.wordpress.com/d/osx?ref=getapps';
const MAC_SILICON_LINK = 'https://apps.wordpress.com/d/osx-silicon?ref=getapps';
const LINUX_TAR_LINK = 'https://apps.wordpress.com/d/linux?ref=getapps';
const LINUX_DEB_LINK = 'https://apps.wordpress.com/d/linux-deb?ref=getapps';
/* eslint-enable wpcalypso/i18n-unlocalized-url */

const noop = () => {};

class DesktopDownloadCard extends Component {
	static propTypes = {
		translate: PropTypes.func,
		trackWindowsClick: PropTypes.func,
		trackMacIntelClick: PropTypes.func,
		trackMacSiliconClick: PropTypes.func,
		trackLinuxTarClick: PropTypes.func,
		trackLinuxDebClick: PropTypes.func,
	};

	static defaultProps = {
		trackWindowsClick: noop,
		trackMacIntelClick: noop,
		trackMacSiliconClick: noop,
		trackLinuxTarClick: noop,
		trackLinuxDebClick: noop,
	};

	getDescription( platform ) {
		switch ( platform ) {
			case 'MacIntel':
			case PLATFORM_MAC_SILICON:
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
			case PLATFORM_MAC_SILICON:
				return translate( 'Requires Mac OS X 10.11+. ' );
			case 'Linux i686':
			case 'Linux i686 on x86_64':
				return translate( 'Requires a 64-bit kernel. ' );
			default:
				return translate( 'Requires Windows 7+. ' );
		}
	}

	getPlatformImage( platformOrLink ) {
		switch ( platformOrLink ) {
			case 'MacIntel':
			case PLATFORM_MAC_SILICON:
			case MAC_SILICON_LINK:
			case MAC_INTEL_LINK:
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

	getAlsoAvailableComponent( { link, platformName } ) {
		const Link = ( props ) => this.getLinkAnchorTag( { ...props, platformLink: link } );
		const Icon = () => this.getPlatformImage( link );
		return (
			<Link>
				<Icon />
				{ platformName }
			</Link>
		);
	}

	getAlsoAvailableTextJetpack( platform ) {
		const macIntelLink = this.getAlsoAvailableComponent( {
			link: MAC_INTEL_LINK,
			platformName: 'Mac (Intel)',
		} );
		const macSiliconLink = this.getAlsoAvailableComponent( {
			link: MAC_SILICON_LINK,
			platformName: 'Mac (Silicon)',
		} );
		const windowsLink = this.getAlsoAvailableComponent( {
			link: WINDOWS_LINK,
			platformName: 'Windows',
		} );
		const linuxTarLink = this.getAlsoAvailableComponent( {
			link: LINUX_TAR_LINK,
			platformName: 'Linux (.tar.gz)',
		} );
		const linuxDebLink = this.getAlsoAvailableComponent( {
			link: LINUX_DEB_LINK,
			platformName: 'Linux (.deb)',
		} );

		switch ( platform ) {
			case 'MacIntel':
			case PLATFORM_MAC_SILICON:
				return (
					<>
						{ windowsLink }
						{ linuxTarLink }
						{ linuxDebLink }
					</>
				);
			case 'Linux i686':
			case 'Linux i686 on x86_64':
				return (
					<>
						{ linuxDebLink }
						{ windowsLink }
						{ macIntelLink }
						{ macSiliconLink }
					</>
				);
			default:
				// Windows
				return (
					<>
						{ macIntelLink }
						{ macSiliconLink }
						{ linuxTarLink }
						{ linuxDebLink }
					</>
				);
		}
	}

	getButtonClickHandler( platform ) {
		const {
			trackWindowsClick,
			trackMacIntelClick,
			trackMacSiliconClick,
			trackLinuxTarClick,
			trackLinuxDebClick,
		} = this.props;

		switch ( platform ) {
			case 'MacIntel':
				return trackMacIntelClick;
			case PLATFORM_MAC_SILICON:
				return trackMacSiliconClick;
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
				return MAC_INTEL_LINK;
			case PLATFORM_MAC_SILICON:
				return MAC_SILICON_LINK;
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
			case PLATFORM_MAC_SILICON:
				return translate( 'Download for Mac (Apple Silicon)' );
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
			case PLATFORM_MAC_SILICON:
				return translate( 'Desktop App for Mac' );
			case 'Linux i686':
			case 'Linux i686 on x86_64':
				return translate( 'Desktop App for Linux' );
			default:
				return translate( 'Desktop App for Windows' );
		}
	}

	getLinkAnchorTag( { platformLink, children } ) {
		const {
			trackWindowsClick,
			trackMacIntelClick,
			trackMacSiliconClick,
			trackLinuxTarClick,
			trackLinuxDebClick,
		} = this.props;

		let onClick = trackWindowsClick;

		switch ( platformLink ) {
			case MAC_INTEL_LINK:
				onClick = trackMacIntelClick;
			case MAC_SILICON_LINK:
				onClick = trackMacSiliconClick;
			case LINUX_TAR_LINK:
				onClick = trackLinuxTarClick;
			case LINUX_DEB_LINK:
				onClick = trackLinuxDebClick;
		}
		return (
			<a
				href={ localizeUrl( platformLink ) }
				onClick={ onClick }
				className="get-apps__desktop-link"
			>
				{ children }
			</a>
		);
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
				{ platform === 'MacIntel' ? (
					<>
						<Button
							className="get-apps__desktop-button"
							href={ localizeUrl( this.getButtonLink( platform ) ) }
							onClick={ this.getButtonClickHandler( platform ) }
						>
							{ this.getButtonText( platform ) }
						</Button>
						<Button
							className="get-apps__desktop-button"
							href={ localizeUrl( this.getButtonLink( PLATFORM_MAC_SILICON ) ) }
							onClick={ this.getButtonClickHandler( PLATFORM_MAC_SILICON ) }
						>
							{ this.getButtonText( PLATFORM_MAC_SILICON ) }
						</Button>
					</>
				) : (
					<Button
						className="get-apps__desktop-button"
						href={ localizeUrl( this.getButtonLink( platform ) ) }
						onClick={ this.getButtonClickHandler( platform ) }
					>
						{ this.getButtonText( platform ) }
					</Button>
				) }

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
	trackMacIntelClick: () => recordTracksEvent( 'calypso_app_download_mac_click' ),
	trackMacSiliconClick: () => recordTracksEvent( 'calypso_app_download_mac_silicon_click' ),
	trackLinuxTarClick: () => recordTracksEvent( 'calypso_app_download_linux_tar_click' ),
	trackLinuxDebClick: () => recordTracksEvent( 'calypso_app_download_linux_deb_click' ),
};

export default connect( null, mapDispatchToProps )( localize( DesktopDownloadCard ) );
