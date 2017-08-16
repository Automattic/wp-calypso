/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import React from 'react';
import PropTypes from 'prop-types';

const OauthClientMasterbar = ( { oauth2ClientData } ) => (
	<header className="masterbar__oauth-client">
		<nav>
			<ul className="masterbar__oauth-client-main-nav">
				<li className="masterbar__oauth-client-current">
					<a className="masterbar__oauth-client-logo">
						<img
							src={ oauth2ClientData.img_url }
							width={ oauth2ClientData.img_width }
							height={ oauth2ClientData.img_height } />
					</a>
				</li>
			</ul>
			<ul className="masterbar__oauth-client-user-nav">
				<li className="masterbar__oauth-client-wpcc-sign-in">
					<a href="https://wordpress.com/" className="masterbar__oauth-client-wpcom">
						<Gridicon icon="my-sites" size={ 24 } />
						WordPress.com
					</a>
				</li>
			</ul>
		</nav>
	</header>
);

OauthClientMasterbar.displayName = 'OauthClientMasterbar';
OauthClientMasterbar.propTypes = {
	oauth2ClientData: PropTypes.object,
};

export default OauthClientMasterbar;
