/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';

/**
 * Internal dependencies
 */
import WordPressLogo from 'components/wordpress-logo';

/**
 * Style dependencies
 */
import './crowdsignal.scss';

class CrowdsignalOauthMasterbar extends Component {
	componentDidMount() {
		// Crowdsignal's OAuth2 pages should load and use the 'Recoleta' font to match the style of the app
		// By loading it here we're not affecting any other pages inside Calypso that don't need the font

		const crowdsignalFonts = [
			new window.FontFace( 'Recoleta', 'url(https://s1.wp.com/i/fonts/recoleta/400.woff2)' ),
			new window.FontFace( 'Recoleta', 'url(https://s1.wp.com/i/fonts/recoleta/700.woff2)', {
				weight: 700,
			} ),
		];

		if ( ! document.fonts.check( '12px Recoleta' ) ) {
			map( crowdsignalFonts, font => {
				font.load().then( loadedFont => document.fonts.add( loadedFont ) );
			} );
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
									{ // translators: product here is an Automattic product (eg: CrowdSignal or JetPack)
									translate(
										'{{span}}%(product)s is {{/span}}built by the people behind WordPress.com',
										{
											args: {
												product: oauth2Client.title,
											},
											components: {
												span: <span className="masterbar__crowdsignal-wide-screen-only" />,
											},
										}
									) }
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
