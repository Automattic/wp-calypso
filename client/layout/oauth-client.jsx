/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getSection } from 'state/ui/selectors';
import { getOAuth2ClientData } from 'state/login/selectors';

const OauthClientLayout = ( {
	primary,
	section,
	oauth2ClientData,
} ) => {
	const clients = {
		930: {
			name: 'vaultpress',
			img_url: 'https://vaultpress.com/images/vaultpress-wpcc-nav-2x.png',
		},
		973: {
			name: 'akismet',
			img_url: 'https://akismet.com/img/akismet-wpcc-logo-2x.png',
		},
		978: {
			name: 'polldaddy',
			img_url: 'https://polldaddy.com/images/polldaddy-wpcc-logo-2x.png',
		},
		1854: {
			name: 'gravatar',
			img_url: 'https://gravatar.com/images/grav-logo-2x.png',
		},
		50019: {
			name: 'woo',
			img_url: 'https://woocommerce.com/wp-content/themes/woomattic/images/logo-woocommerce@2x.png',
		},
		50915: {
			name: 'woo',
			img_url: 'https://woocommerce.com/wp-content/themes/woomattic/images/logo-woocommerce@2x.png',
		},
		50916: {
			name: 'woo',
			img_url: 'https://woocommerce.com/wp-content/themes/woomattic/images/logo-woocommerce@2x.png',
		},
	};

	let client = false;
	if ( oauth2ClientData && oauth2ClientData.id in clients ) {
		client = clients[ oauth2ClientData.id ];
	}

	const classes = classNames( 'layout', {
		[ 'is-group-' + section.group ]: !! section,
		[ 'is-section-' + section.name ]: !! section,
		'focus-content': true,
		'has-no-sidebar': true, // Logged-out never has a sidebar
		'wp-singletree-layout': !! primary,
		[ 'dops-' + client.name ]: !! client,
	} );

	return (
		<div className={ classes }>

			<div id="content" className="layout__content">
				<div id="primary" className="layout__primary">
					{ primary }
				</div>
			</div>
		</div>
	);
};

OauthClientLayout.displayName = 'OauthClientLayout';
OauthClientLayout.propTypes = {
	primary: PropTypes.element,
	section: PropTypes.oneOfType( [
		PropTypes.bool,
		PropTypes.object,
	] ),
	oauth2ClientData: PropTypes.number,
};

export default connect(
	state => ( {
		section: getSection( state ),
		oauth2ClientData: getOAuth2ClientData( state ),
	} )
)( OauthClientLayout );
