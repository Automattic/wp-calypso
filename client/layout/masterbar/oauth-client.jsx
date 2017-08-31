/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { addLocaleToWpcomUrl, getLocaleSlug } from 'lib/i18n-utils';

const OauthClientMasterbar = ( { oauth2Client } ) => (
	<header className="masterbar masterbar__oauth-client">
		<nav>
			<ul className="masterbar__oauth-client-main-nav">
				<li className="masterbar__oauth-client-current">
					<a className="masterbar__oauth-client-logo">
						<img
							src={ oauth2Client.img_url }
							width={ oauth2Client.img_width }
							height={ oauth2Client.img_height } />
					</a>
				</li>
			</ul>
			{ oauth2Client.name === 'woo' ? (
				<li className="masterbar__oauth-client-close">
					<a href="https://woocommerce.com">Cancel <span>X</span></a>
				</li>
			) : (
				<ul className="masterbar__oauth-client-user-nav">
					<li className="masterbar__oauth-client-wpcc-sign-in">
						<a
							href={ addLocaleToWpcomUrl( 'https://wordpress.com/', getLocaleSlug() ) }
							className="masterbar__oauth-client-wpcom"
							target="_self"
						>
							<Gridicon icon="my-sites" size={ 24 } />
							WordPress.com
						</a>
					</li>
				</ul>
			) }
		</nav>
	</header>
);

OauthClientMasterbar.displayName = 'OauthClientMasterbar';
OauthClientMasterbar.propTypes = {
	oauth2Client: PropTypes.object,
};

export default OauthClientMasterbar;
