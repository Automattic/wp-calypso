/** @format */

/**
 * External dependencies
 */

import Gridicon from 'gridicons';
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { addLocaleToWpcomUrl, getLocaleSlug } from 'client/lib/i18n-utils';
import { isWooOAuth2Client } from 'client/lib/oauth2-clients';

const OauthClientMasterbar = ( { oauth2Client } ) => (
	<header className="masterbar masterbar__oauth-client">
		<nav>
			<ul className="masterbar__oauth-client-main-nav">
				<li className="masterbar__oauth-client-current">
					{ oauth2Client.icon && (
						<div className="masterbar__oauth-client-logo">
							<img src={ oauth2Client.icon } />
						</div>
					) }
				</li>

				{ isWooOAuth2Client( oauth2Client ) ? (
					<li className="masterbar__oauth-client-close">
						<a href="https://woocommerce.com">
							Cancel <span>X</span>
						</a>
					</li>
				) : (
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
				) }
			</ul>
		</nav>
	</header>
);

OauthClientMasterbar.displayName = 'OauthClientMasterbar';
OauthClientMasterbar.propTypes = {
	oauth2Client: PropTypes.object,
};

export default OauthClientMasterbar;
