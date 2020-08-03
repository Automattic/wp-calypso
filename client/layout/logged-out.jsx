/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { includes, get, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import config from 'config';
import MasterbarLoggedOut from 'layout/masterbar/logged-out';
import notices from 'notices';
import OauthClientMasterbar from 'layout/masterbar/oauth-client';
import { isCrowdsignalOAuth2Client, isWooOAuth2Client } from 'lib/oauth2-clients';
import { getCurrentOAuth2Client, showOAuth2Layout } from 'state/oauth2-clients/ui/selectors';
import { getCurrentRoute } from 'state/selectors/get-current-route';
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';
import { getSection, masterbarIsVisible } from 'state/ui/selectors';
import BodySectionCssClass from './body-section-css-class';
import GdprBanner from 'blocks/gdpr-banner';
import wooDnaConfig from 'jetpack-connect/woo-dna-config';

/**
 * Style dependencies
 */
import './style.scss';

// Returns true if given section should display sidebar for logged out users.
const hasSidebar = ( section ) => {
	if ( section.name === 'devdocs' ) {
		// Devdocs should always display a sidebar, except for landing page.
		return ! includes( section.paths, '/devdocs/start' );
	}

	return false;
};

const LayoutLoggedOut = ( {
	currentRoute,
	isJetpackLogin,
	isGutenboardingLogin,
	isPopup,
	isJetpackWooCommerceFlow,
	isJetpackWooDnaFlow,
	wccomFrom,
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
	const isCheckout = sectionName === 'checkout';

	const classes = {
		[ 'is-group-' + sectionGroup ]: sectionGroup,
		[ 'is-section-' + sectionName ]: sectionName,
		'is-add-site-page': currentRoute === '/jetpack/new',
		'focus-content': true,
		'has-no-sidebar': ! hasSidebar( section ),
		'has-no-masterbar': masterbarIsHidden,
		'is-jetpack-login': isJetpackLogin,
		'is-gutenboarding-login': isGutenboardingLogin,
		'is-popup': isPopup,
		'is-jetpack-woocommerce-flow':
			config.isEnabled( 'jetpack/connect/woocommerce' ) && isJetpackWooCommerceFlow,
		'is-jetpack-woo-dna-flow': isJetpackWooDnaFlow,
		'is-wccom-oauth-flow':
			config.isEnabled( 'woocommerce/onboarding-oauth' ) &&
			isWooOAuth2Client( oauth2Client ) &&
			wccomFrom,
	};

	let masterbar = null;

	// Uses custom styles for DOPS clients and WooCommerce - which are the only ones with a name property defined
	if ( useOAuth2Layout && oauth2Client && oauth2Client.name ) {
		if (
			config.isEnabled( 'woocommerce/onboarding-oauth' ) &&
			isWooOAuth2Client( oauth2Client ) &&
			wccomFrom
		) {
			masterbar = null;
		} else {
			classes.dops = true;
			classes[ oauth2Client.name ] = true;

			// Force masterbar for all Crowdsignal OAuth pages
			if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
				classes[ 'has-no-masterbar' ] = false;
			}

			masterbar = <OauthClientMasterbar oauth2Client={ oauth2Client } />;
		}
	} else if ( config.isEnabled( 'jetpack-cloud' ) ) {
		masterbar = null;
	} else {
		masterbar = (
			<MasterbarLoggedOut
				title={ section.title }
				isCheckout={ isCheckout }
				redirectUri={ redirectUri }
			/>
		);
	}

	return (
		<div className={ classNames( 'layout', classes ) }>
			<BodySectionCssClass group={ sectionGroup } section={ sectionName } />
			{ masterbar }
			<div id="content" className="layout__content">
				<AsyncLoad
					require="components/global-notices"
					placeholder={ null }
					id="notices"
					notices={ notices.list }
				/>
				{ isCheckout && <AsyncLoad require="blocks/inline-help" placeholder={ null } /> }
				<div id="primary" className="layout__primary">
					{ primary }
				</div>
				<div id="secondary" className="layout__secondary">
					{ secondary }
				</div>
			</div>
			{ config.isEnabled( 'gdpr-banner' ) && <GdprBanner /> }
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

export default connect( ( state ) => {
	const section = getSection( state );
	const currentRoute = getCurrentRoute( state );
	const isJetpackLogin = startsWith( currentRoute, '/log-in/jetpack' );
	const isGutenboardingLogin = startsWith( currentRoute, '/log-in/new' );
	const noMasterbarForRoute = isJetpackLogin || isGutenboardingLogin;
	const isPopup = '1' === get( getCurrentQueryArguments( state ), 'is_popup' );
	const noMasterbarForSection = 'signup' === section.name || 'jetpack-connect' === section.name;
	const isJetpackWooCommerceFlow =
		'woocommerce-onboarding' === get( getCurrentQueryArguments( state ), 'from' );
	const isJetpackWooDnaFlow = wooDnaConfig( getCurrentQueryArguments( state ) ).isWooDnaFlow();
	const wccomFrom = get( getCurrentQueryArguments( state ), 'wccom-from' );

	return {
		currentRoute,
		isJetpackLogin,
		isGutenboardingLogin,
		isPopup,
		isJetpackWooCommerceFlow,
		isJetpackWooDnaFlow,
		wccomFrom,
		masterbarIsHidden:
			! masterbarIsVisible( state ) || noMasterbarForSection || noMasterbarForRoute,
		section,
		oauth2Client: getCurrentOAuth2Client( state ),
		useOAuth2Layout: showOAuth2Layout( state ),
	};
} )( LayoutLoggedOut );
