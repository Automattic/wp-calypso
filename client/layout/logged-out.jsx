/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { includes, get } from 'lodash';

/**
 * Internal dependencies
 */
import GlobalNotices from 'components/global-notices';
import MasterbarLoggedOut from 'layout/masterbar/logged-out';
import notices from 'notices';
import OauthClientMasterbar from 'layout/masterbar/oauth-client';
import { isCrowdsignalOAuth2Client } from 'lib/oauth2-clients';
import { getCurrentOAuth2Client, showOAuth2Layout } from 'state/ui/oauth2-clients/selectors';
import { getCurrentRoute } from 'state/selectors/get-current-route';
import { getSection, masterbarIsVisible } from 'state/ui/selectors';
import BodySectionCssClass from './body-section-css-class';

// Returns true if given section should display sidebar for logged out users.
const hasSidebar = section => {
	if ( section.name === 'devdocs' ) {
		// Devdocs should always display a sidebar, except for landing page.
		return ! includes( section.paths, '/devdocs/start' );
	}

	return false;
};

const LayoutLoggedOut = ( {
	currentRoute,
	isJetpackLogin,
	masterbarIsHidden,
	oauth2Client,
	primary,
	secondary,
	section,
	redirectUri,
	useOAuth2Layout,
} ) => {
	const sectionGroup = get( section, 'group', null );
	const sectionName = get( section, 'name', null );

	const classes = {
		[ 'is-group-' + sectionGroup ]: sectionGroup,
		[ 'is-section-' + sectionName ]: sectionName,
		'is-add-site-page': currentRoute === '/jetpack/new',
		'focus-content': true,
		'has-no-sidebar': ! hasSidebar( section ),
		'has-no-masterbar': masterbarIsHidden,
		'is-jetpack-login': isJetpackLogin,
	};

	let masterbar = null;

	// Uses custom styles for DOPS clients and WooCommerce - which are the only ones with a name property defined
	if ( useOAuth2Layout && oauth2Client && oauth2Client.name ) {
		classes.dops = true;
		classes[ oauth2Client.name ] = true;

		// Force masterbar for all Crowdsignal OAuth pages
		if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
			classes[ 'has-no-masterbar' ] = false;
		}

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
			<BodySectionCssClass group={ sectionGroup } section={ sectionName } />
			{ masterbar }
			<div id="content" className="layout__content">
				<GlobalNotices id="notices" notices={ notices.list } />
				<div id="primary" className="layout__primary">
					{ primary }
				</div>
				<div id="secondary" className="layout__secondary">
					{ secondary }
				</div>
			</div>
		</div>
	);
};

LayoutLoggedOut.displayName = 'LayoutLoggedOut';
LayoutLoggedOut.propTypes = {
	primary: PropTypes.element,
	secondary: PropTypes.element,
	// Connected props
	currentRoute: PropTypes.string,
	masterbarIsHidden: PropTypes.bool,
	section: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
	redirectUri: PropTypes.string,
	showOAuth2Layout: PropTypes.bool,
};

export default connect( state => {
	const section = getSection( state );
	const currentRoute = getCurrentRoute( state );
	const isJetpackLogin = currentRoute === '/log-in/jetpack';
	const noMasterbarForRoute = currentRoute === '/log-in/jetpack';
	const noMasterbarForSection = 'signup' === section.name || 'jetpack-connect' === section.name;

	return {
		currentRoute,
		isJetpackLogin,
		masterbarIsHidden:
			! masterbarIsVisible( state ) || noMasterbarForSection || noMasterbarForRoute,
		section,
		oauth2Client: getCurrentOAuth2Client( state ),
		useOAuth2Layout: showOAuth2Layout( state ),
	};
} )( LayoutLoggedOut );
