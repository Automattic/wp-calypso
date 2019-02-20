/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import WordPressLogo from 'components/wordpress-logo';

const CrowdsignalOauthMasterbar = ( { oauth2Client, translate } ) => (
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
							{ translate(
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

export default localize( CrowdsignalOauthMasterbar );
