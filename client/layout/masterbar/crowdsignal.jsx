/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { filter, tap } from 'lodash';

/**
 * Internal dependencies
 */
import WordPressLogo from 'components/wordpress-logo';

class CrowdsignalOauthMasterbar extends Component {
	componentDidMount() {
		// Crowdsignal's OAuth2 pages should load and use the 'Muli' font to match the marketing page
		// By loading it here we're not affecting any other pages inside Calypso that don't need the font
		const crowdsignalGoogleFontsLink = 'https://fonts.googleapis.com/css?family=Muli:400,600';
		const crowdsignalFonts = filter(
			Array.from( document.head.childNodes ),
			( node ) => node.nodeName.toLowerCase() === 'link' && node.href === crowdsignalGoogleFontsLink,
		);

		if ( crowdsignalFonts.length === 0 ) {
			document.head.appendChild( tap(
				document.createElement( 'link' ),
				( link ) => {
					link.type = 'text/css';
					link.rel = 'stylesheet';
					link.href = crowdsignalGoogleFontsLink;
				}
			) );
		}
	}

	render() {
		const { oauth2Client, translate } = this.props;

		return (
			<header className="masterbar masterbar__crowdsignal">
				<nav className="masterbar__crowdsignal-nav-wrapper">
					<ul className="masterbar__crowdsignal-nav">
						<li className="masterbar__crowdsignal-nav-item">
							<a href="https://crowdsignal.com" className="masterbar__crowdsignal-link">
								<img
									className="masterbar__crowdsignal-client-logo"
									src={ oauth2Client.icon }
									alt={ oauth2Client.title }
								/>
							</a>
						</li>

						<li className="masterbar__crowdsignal-nav-item masterbar__crowdsignal-nav-text">
							<p className="masterbar__crowdsignal-text">
								<span>
									{ translate( '{{span}}%(product)s is {{/span}}built by the people behind WordPress.com', {
										args: {
											product: oauth2Client.title,
										},
										components: {
											span: <span className="masterbar__crowdsignal-wide-screen-only" />
										}
									} ) }
								</span>
							</p>
						</li>
						<li className="masterbar__crowdsignal-nav-item">
							<a href="https://wordpress.com" className="masterbar__crowdsignal-link">
								<WordPressLogo size={ 40 } className="masterbar__crowdsignal-wordpress-logo" />
							</a>
						</li>
					</ul>
				</nav>
			</header>
		);
	}
}

export default localize( CrowdsignalOauthMasterbar );
