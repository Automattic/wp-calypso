/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';

const OauthClientLayout = ( { client } ) => (
	<div className="oauth-client">
		<nav>
			<ul className="oauth-client__main-nav">
				<li className="oauth-client__current">
					<a className="oauth-client__logo">
						<img src={ client.img_url } width={ client.img_width } height={ client.img_height } scale="2" />
					</a>
				</li>
				{ client.name === 'woo' && (
					<li className="oauth-client__woocommerce-close">
						<a href="https://woocommerce.com">Cancel <span>X</span></a>
					</li>
				) }
			</ul>

			{ client.name !== 'woo' && (
				<ul className="oauth-client__user-nav">
					<li className="oauth-client__wpcc-sign-in">
						<a href="https://wordpress.com/" className="oauth-client__wpcom">WordPress.com</a>
					</li>
				</ul>
			) }
		</nav>
	</div>
);

OauthClientLayout.displayName = 'OauthClientLayout';
OauthClientLayout.propTypes = {
	client: PropTypes.object,
};

export default OauthClientLayout;
