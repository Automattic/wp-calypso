/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get, startsWith, flowRight as compose } from 'lodash';

/**
 * Internal dependencies
 */
import AsyncLoad from 'calypso/components/async-load';
import config from '@automattic/calypso-config';
import MasterbarLoggedOut from 'calypso/layout/masterbar/logged-out';
import OauthClientMasterbar from 'calypso/layout/masterbar/oauth-client';
import { isCrowdsignalOAuth2Client, isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import {
	getCurrentOAuth2Client,
	showOAuth2Layout,
} from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import { masterbarIsVisible } from 'calypso/state/ui/selectors';
import BodySectionCssClass from './body-section-css-class';
import GdprBanner from 'calypso/blocks/gdpr-banner';
import wooDnaConfig from 'calypso/jetpack-connect/woo-dna-config';
import { withCurrentRoute } from 'calypso/components/route';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import QueryReaderTeams from 'calypso/components/data/query-reader-teams';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { getReaderTeams } from 'calypso/state/teams/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const LayoutLoggedOut = ( {
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
	sectionGroup,
	sectionName,
	sectionTitle,
	redirectUri,
	useOAuth2Layout,
	shouldRequestReaderTeams,
	useFontSmoothAntialiased,
} ) => {
	const isCheckout = sectionName === 'checkout';
	const isJetpackCheckout =
		sectionName === 'checkout' && window.location.pathname.startsWith( '/checkout/jetpack' );

	const isJetpackThankYou =
		sectionName === 'checkout' &&
		window.location.pathname.startsWith( '/checkout/jetpack/thank-you' );

	const classes = {
		[ 'is-group-' + sectionGroup ]: sectionGroup,
		[ 'is-section-' + sectionName ]: sectionName,
		'focus-content': true,
		'has-no-sidebar': ! secondary,
		'has-no-masterbar': masterbarIsHidden,
		'is-jetpack-login': isJetpackLogin,
		'is-jetpack-site': isJetpackCheckout,
		'is-gutenboarding-login': isGutenboardingLogin,
		'is-popup': isPopup,
		'is-jetpack-woocommerce-flow': isJetpackWooCommerceFlow,
		'is-jetpack-woo-dna-flow': isJetpackWooDnaFlow,
		'is-wccom-oauth-flow': isWooOAuth2Client( oauth2Client ) && wccomFrom,
	};

	let masterbar = null;

	// Uses custom styles for DOPS clients and WooCommerce - which are the only ones with a name property defined
	if ( useOAuth2Layout && oauth2Client && oauth2Client.name ) {
		if ( isWooOAuth2Client( oauth2Client ) && wccomFrom ) {
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
	} else if ( config.isEnabled( 'jetpack-cloud' ) || isWpMobileApp() || isJetpackThankYou ) {
		masterbar = null;
	} else {
		masterbar = (
			<MasterbarLoggedOut
				title={ sectionTitle }
				sectionName={ sectionName }
				isCheckout={ isCheckout }
				redirectUri={ redirectUri }
			/>
		);
	}

	const bodyClass = [];
	if ( useFontSmoothAntialiased ) {
		bodyClass.push( 'font-smoothing-antialiased' );
	}

	return (
		<div className={ classNames( 'layout', classes ) }>
			{ shouldRequestReaderTeams && <QueryReaderTeams /> }
			<BodySectionCssClass group={ sectionGroup } section={ sectionName } bodyClass={ bodyClass } />
			{ masterbar }
			<div id="content" className="layout__content">
				<AsyncLoad require="calypso/components/global-notices" placeholder={ null } id="notices" />
				{ isCheckout && <AsyncLoad require="calypso/blocks/inline-help" placeholder={ null } /> }
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
	shouldRequestReaderTeams: PropTypes.bool,
	useFontSmoothAntialiased: PropTypes.bool,
};

export default compose(
	withCurrentRoute,
	connect( ( state, { currentSection, currentRoute } ) => {
		const sectionGroup = currentSection?.group ?? null;
		const sectionName = currentSection?.name ?? null;
		const sectionTitle = currentSection?.title ?? '';
		const isJetpackLogin = startsWith( currentRoute, '/log-in/jetpack' );
		const isGutenboardingLogin = startsWith( currentRoute, '/log-in/new' );
		const isJetpackWooDnaFlow = wooDnaConfig( getInitialQueryArguments( state ) ).isWooDnaFlow();
		const noMasterbarForRoute = isJetpackLogin || isGutenboardingLogin || isJetpackWooDnaFlow;
		const isPopup = '1' === get( getCurrentQueryArguments( state ), 'is_popup' );
		const noMasterbarForSection = [ 'signup', 'jetpack-connect' ].includes( sectionName );
		const isJetpackWooCommerceFlow =
			'woocommerce-onboarding' === get( getCurrentQueryArguments( state ), 'from' );
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
			sectionGroup,
			sectionName,
			sectionTitle,
			oauth2Client: getCurrentOAuth2Client( state ),
			useOAuth2Layout: showOAuth2Layout( state ),
			shouldRequestReaderTeams: !! getCurrentUser( state ),
			useFontSmoothAntialiased: isAutomatticTeamMember( getReaderTeams( state ) ),
		};
	} )
)( LayoutLoggedOut );
