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
import { getSection } from 'state/ui/selectors';
import OauthClientMasterbar from 'layout/masterbar/oauth-client';
import { getCurrentOAuth2Client, showOAuth2Layout } from 'state/ui/oauth2-clients/selectors';

const LayoutLoggedOut = ( {
	oauth2Client,
	primary,
	section,
	redirectUri,
	useOAuth2Layout,
} ) => {
	const classNameObject = {
		[ 'is-group-' + section.group ]: !! section,
		[ 'is-section-' + section.name ]: !! section,
		'focus-content': true,
		'has-no-sidebar': true, // Logged-out never has a sidebar
		'wp-singletree-layout': !! primary,
	};

	let masterbar = null;

	if ( useOAuth2Layout ) {
		const hasValidOAuth2ClientData = !! oauth2Client;
		const oauthClientName = hasValidOAuth2ClientData && oauth2Client.name;
		classNameObject.dops = hasValidOAuth2ClientData;
		classNameObject[ oauthClientName ] = hasValidOAuth2ClientData;

		if ( oauthClientName ) {
			masterbar = <OauthClientMasterbar oauth2Client={ oauth2Client } />;
		}
	}

	if ( ! masterbar ) {
		masterbar = <MasterbarLoggedOut
			title={ section.title }
			sectionName={ section.name }
			redirectUri={ redirectUri }
		/>;
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
		oauth2Client: getCurrentOAuth2Client( state ),
		useOAuth2Layout: showOAuth2Layout( state ),
	} )
)( LayoutLoggedOut );
