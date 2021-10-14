import config from '@automattic/calypso-config';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import GdprBanner from 'calypso/blocks/gdpr-banner';
import AsyncLoad from 'calypso/components/async-load';
import { withCurrentRoute } from 'calypso/components/route';
import wooDnaConfig from 'calypso/jetpack-connect/woo-dna-config';
import MasterbarLoggedOut from 'calypso/layout/masterbar/logged-out';
import OauthClientMasterbar from 'calypso/layout/masterbar/oauth-client';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import { isCrowdsignalOAuth2Client, isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import {
	getCurrentOAuth2Client,
	showOAuth2Layout,
} from 'calypso/state/oauth2-clients/ui/selectors';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import { masterbarIsVisible } from 'calypso/state/ui/selectors';
import BodySectionCssClass from './body-section-css-class';
import './style.scss';

const LayoutLoggedOut = ( {
	isJetpackLogin,
	isWhiteLogin,
	isPopup,
	isJetpackWooCommerceFlow,
	isJetpackWooDnaFlow,
	isP2Login,
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
		'is-white-login': isWhiteLogin,
		'is-popup': isPopup,
		'is-jetpack-woocommerce-flow': isJetpackWooCommerceFlow,
		'is-jetpack-woo-dna-flow': isJetpackWooDnaFlow,
		'is-wccom-oauth-flow': isWooOAuth2Client( oauth2Client ) && wccomFrom,
		'is-p2-login': isP2Login,
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

	const bodyClass = [ 'font-smoothing-antialiased' ];

	return (
		<div className={ classNames( 'layout', classes ) }>
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
};

export default withCurrentRoute(
	connect( ( state, { currentSection, currentRoute, currentQuery } ) => {
		const sectionGroup = currentSection?.group ?? null;
		const sectionName = currentSection?.name ?? null;
		const sectionTitle = currentSection?.title ?? '';
		const isJetpackLogin = currentRoute.startsWith( '/log-in/jetpack' );
		const isWhiteLogin = currentRoute.startsWith( '/log-in/new' );
		const isJetpackWooDnaFlow = wooDnaConfig( getInitialQueryArguments( state ) ).isWooDnaFlow();
		const isP2Login = 'login' === sectionName && 'p2' === currentQuery?.from;
		const noMasterbarForRoute = isJetpackLogin || isWhiteLogin || isJetpackWooDnaFlow || isP2Login;
		const isPopup = '1' === currentQuery?.is_popup;
		const noMasterbarForSection = [ 'signup', 'jetpack-connect' ].includes( sectionName );
		const isJetpackWooCommerceFlow = 'woocommerce-onboarding' === currentQuery?.from;
		const wccomFrom = currentQuery?.[ 'wccom-from' ];

		return {
			isJetpackLogin,
			isWhiteLogin,
			isPopup,
			isJetpackWooCommerceFlow,
			isJetpackWooDnaFlow,
			isP2Login,
			wccomFrom,
			masterbarIsHidden:
				! masterbarIsVisible( state ) || noMasterbarForSection || noMasterbarForRoute,
			sectionGroup,
			sectionName,
			sectionTitle,
			oauth2Client: getCurrentOAuth2Client( state ),
			useOAuth2Layout: showOAuth2Layout( state ),
		};
	} )( LayoutLoggedOut )
);
