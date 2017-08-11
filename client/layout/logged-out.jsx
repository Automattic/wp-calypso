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
import MasterbarLoggedOut from 'layout/masterbar/logged-out';
import { getOAuth2ClientData } from 'state/login/selectors';
import { getSection } from 'state/ui/selectors';
import OauthClientLayout from 'layout/oauth-client';
import { showOAuth2Layout } from 'state/login/oauth2/selectors';

const LayoutLoggedOut = ( {
	oauth2ClientData,
	primary,
	section,
	redirectUri,
	useOAuth2Layout,
} ) => {
	let client = null;
	if ( oauth2ClientData && oauth2ClientData.id in clients ) {
		client = clients[ oauth2ClientData.id ];
	}

	const classNameObject = {
		[ 'is-group-' + section.group ]: !! section,
		[ 'is-section-' + section.name ]: !! section,
		'focus-content': true,
		'has-no-sidebar': true, // Logged-out never has a sidebar
		'wp-singletree-layout': !! primary,
		dops: !! client,
	};

	if ( client ) {
		classNameObject[ client.name ] = !! client;
	}

	let masterbar = <MasterbarLoggedOut title={ section.title } sectionName={ section.name } redirectUri={ redirectUri } />;
	if ( useOAuth2Layout && client ) {
		masterbar = <OauthClientLayout client={ client } />;
	}

	return (
		<div className={ classNames( 'layout', classNameObject ) }>
			{ masterbar }
			<div id="content" className="layout__content">
				<div id="primary" className="layout__primary">
					{ primary }
				</div>
				<div id="secondary" className="layout__secondary">
				</div>
			</div>
		</div>
	);
};

LayoutLoggedOut.displayName = 'LayoutLoggedOut';
LayoutLoggedOut.propTypes = {
	primary: PropTypes.element,
	secondary: PropTypes.element,
	section: PropTypes.oneOfType( [
		PropTypes.bool,
		PropTypes.object,
	] ),
	redirectUri: PropTypes.string,
	showOAuth2Layout: PropTypes.bool,
};

export default connect(
	state => ( {
		section: getSection( state ),
		oauth2ClientData: getOAuth2ClientData( state ),
		useOAuth2Layout: showOAuth2Layout( state ),
	} )
)( LayoutLoggedOut );
