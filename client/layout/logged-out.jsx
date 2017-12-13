/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import MasterbarLoggedOut from 'layout/masterbar/logged-out';
import { getSection } from 'state/ui/selectors';
import OauthClientMasterbar from 'layout/masterbar/oauth-client';
import { getCurrentOAuth2Client, showOAuth2Layout } from 'state/ui/oauth2-clients/selectors';

// Returns true if given section should display sidebar for logged out users.
const hasSidebar = section => {
	if ( section.name === 'devdocs' ) {
		// Devdocs should always display a sidebar, except for landing page.
		return ! includes( section.paths, '/devdocs/start' );
	}

	return false;
};

const LayoutLoggedOut = ( { oauth2Client, primary, section, redirectUri, useOAuth2Layout } ) => {
	const classes = {
		[ 'is-group-' + section.group ]: !! section,
		[ 'is-section-' + section.name ]: !! section,
		'focus-content': true,
		'has-no-sidebar': ! hasSidebar( section ),
	};

	let masterbar = null;

	// Uses custom styles for DOPS clients and WooCommerce - which are the only ones with a name property defined
	if ( useOAuth2Layout && oauth2Client && oauth2Client.name ) {
		classes.dops = true;
		classes[ oauth2Client.name ] = true;

		masterbar = <OauthClientMasterbar oauth2Client={ oauth2Client } />;
	} else {
		masterbar = (
			<MasterbarLoggedOut
				title={ section.title }
				sectionName={ section.name }
				redirectUri={ redirectUri }
			/>
		);
	}

	return (
		<div className={ classNames( 'layout', classes ) }>
			{ masterbar }

			<div id="content" className="layout__content">
				<div id="primary" className="layout__primary">
					{ primary }
				</div>

				<div id="secondary" className="layout__secondary" />
			</div>
		</div>
	);
};

LayoutLoggedOut.displayName = 'LayoutLoggedOut';
LayoutLoggedOut.propTypes = {
	primary: PropTypes.element,
	secondary: PropTypes.element,
	section: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
	redirectUri: PropTypes.string,
	showOAuth2Layout: PropTypes.bool,
};

export default connect( state => ( {
	section: getSection( state ),
	oauth2Client: getCurrentOAuth2Client( state ),
	useOAuth2Layout: showOAuth2Layout( state ),
} ) )( LayoutLoggedOut );
