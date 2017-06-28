/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { identity, partial, noop } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import { recordTracksEvent } from 'state/analytics/actions';

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

	constructor( props ) {
		super( props );

		this.windowsLink = 'https://apps.wordpress.com/d/windows?ref=getapps';
		this.macLink = 'https://apps.wordpress.com/d/osx?ref=getapps';
		this.linuxTarLink = 'https://apps.wordpress.com/d/linux?ref=getapps';
		this.linuxDebLink = 'https://apps.wordpress.com/d/linux-deb?ref=getapps';
	}

	getDescription = ( platform ) => {
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

	getRequirementsText = ( platform ) => {
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

	getTranslateComponents = ( platform ) => {
		switch ( platform ) {
			case 'MacIntel':
				return {
					firstAvailableLink: this.getLinkAnchorTag( this.windowsLink ),
					secondAvailableLink: this.getLinkAnchorTag( this.linuxTarLink ),
					thirdAvailableLink: this.getLinkAnchorTag( this.linuxDebLink ),
				};
			case 'Linux i686':
			case 'Linux i686 on x86_64':
				return {
					firstAvailableLink: this.getLinkAnchorTag( this.linuxDebLink ),
					secondAvailableLink: this.getLinkAnchorTag( this.windowsLink ),
					thirdAvailableLink: this.getLinkAnchorTag( this.macLink ),
				};
			default:
				return {
					firstAvailableLink: this.getLinkAnchorTag( this.macLink ),
					secondAvailableLink: this.getLinkAnchorTag( this.linuxTarLink ),
					thirdAvailableLink: this.getLinkAnchorTag( this.linuxDebLink ),
				};
		}
	}

	getAlsoAvailableText = ( platform ) => {
		const { translate } = this.props;
		switch ( platform ) {
			case 'MacIntel':
				return translate( 'Also available for: ' +
					'{{firstAvailableLink}}Windows{{/firstAvailableLink}}, ' +
					'{{secondAvailableLink}}Linux (.tar.gz){{/secondAvailableLink}}, ' +
					'{{thirdAvailableLink}}Linux (.deb){{/thirdAvailableLink}}.',
					{ components: this.getTranslateComponents( platform ) }
				);
			case 'Linux i686':
			case 'Linux i686 on x86_64':
				return translate( 'Also available for: ' +
					'{{firstAvailableLink}}Linux (.deb){{/firstAvailableLink}}, ' +
					'{{secondAvailableLink}}Windows{{/secondAvailableLink}}, ' +
					'{{thirdAvailableLink}}Mac{{/thirdAvailableLink}}.',
					{ components: this.getTranslateComponents( platform ) }
				);
			default:
				return translate( 'Also available for: ' +
					'{{firstAvailableLink}}MacOS{{/firstAvailableLink}}, ' +
					'{{secondAvailableLink}}Linux (.tar.gz){{/secondAvailableLink}}, ' +
					'{{thirdAvailableLink}}Linux (.deb){{/thirdAvailableLink}}.',
					{ components: this.getTranslateComponents( platform ) }
				);
		}
	}

	getButtonClickHandler = ( platform ) => {
		const {
			trackWindowsClick,
			trackMacClick,
			trackLinuxTarClick,
			trackLinuxDebClick,
		} = this.props;

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

	getButtonLink = ( platform ) => {
		switch ( platform ) {
			case 'MacIntel':
				return this.macLink;
			case 'Linux i686':
			case 'Linux i686 on x86_64':
				return this.linuxTarLink;
			default:
				return this.windowsLink;
		}
	}

	getCardTitle = ( platform ) => {
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

	getLinkAnchorTag = ( platformLink ) => {
		switch ( platformLink ) {
			case this.macLink:
				return <a href={ platformLink } onClick={ this.trackMacClick } />;
			case this.linuxTarLink:
				return <a href={ platformLink } onClick={ this.trackLinuxTarClick } />;
			case this.linuxDebLink:
				return <a href={ platformLink } onClick={ this.trackLinuxDebClick } />;
			default:
				return <a href={ platformLink } onClick={ this.trackWindowsClick } />;
		}
	}

	render() {
		const { translate } = this.props;
		const platform = ( navigator.platform && navigator.platform.length > 0 ) ? navigator.platform : false;
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
					onClick={ this.getButtonClickHandler( platform ) }>
					{ translate( 'Download' ) }
				</Button>
			</Card>
		);
	}
}

const mapDispatchToProps = {
	trackWindowsClick: partial( recordTracksEvent, 'calypso_app_download_windows_click' ),
	trackMacClick: partial( recordTracksEvent, 'calypso_app_download_mac_click' ),
	trackLinuxTarClick: partial( recordTracksEvent, 'calypso_app_download_linux_tar_click' ),
	trackLinuxDebClick: partial( recordTracksEvent, 'calypso_app_download_linux_deb_click' ),
};

export default connect(
	null,
	mapDispatchToProps
)( localize( DesktopDownloadCard ) );
