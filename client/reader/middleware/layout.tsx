import config from '@automattic/calypso-config';
import { isWithinBreakpoint, subscribeIsWithinBreakpoint } from '@automattic/viewport';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component, useEffect } from 'react';
import { connect } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
import QuerySites from 'calypso/components/data/query-sites';
import { withCurrentRoute } from 'calypso/components/route';
import SympathyDevWarning from 'calypso/components/sympathy-dev-warning';
import { retrieveMobileRedirect } from 'calypso/jetpack-connect/persistence-utils';
import { isWcMobileApp } from 'calypso/lib/mobile-app';
import { isCrowdsignalOAuth2Client } from 'calypso/lib/oauth2-clients';
import UserVerificationChecker from 'calypso/lib/user/verification-checker';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSidebarType, SidebarType } from 'calypso/state/global-sidebar/selectors';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import { isReaderMSDEnabled } from 'calypso/state/reader-ui/selectors';
import { isSupportSession } from 'calypso/state/support/selectors';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

function SidebarOverflowDelay( { layoutFocus } ) {
	const setSidebarOverflowClass = ( overflow ) => {
		const classList = document.querySelector( 'body' ).classList;
		if ( overflow ) {
			classList.add( 'is-sidebar-overflow' );
		} else {
			classList.remove( 'is-sidebar-overflow' );
		}
	};

	useEffect( () => {
		if ( layoutFocus !== 'sites' ) {
			// The sidebar menu uses a flyout design that requires the overflowing content
			// to be visible. However, `overflow` isn't an animatable CSS property, so we
			// need to set it after the sliding transition finishes. We wait for 150ms (the
			// CSS transition time) + a grace period of 350ms (since the sidebar menu is
			// rendered asynchronously).
			// @see https://github.com/Automattic/wp-calypso/issues/47019
			setTimeout( () => {
				setSidebarOverflowClass( true );
			}, 500 );
		} else {
			setSidebarOverflowClass( false );
		}
	}, [ layoutFocus ] );

	return null;
}

class Layout extends Component {
	static propTypes = {
		primary: PropTypes.element,
		secondary: PropTypes.element,
		beforePrimary: PropTypes.element,
		focus: PropTypes.object,
		// connected props
		masterbarIsHidden: PropTypes.bool,
		isSupportSession: PropTypes.bool,
		sectionGroup: PropTypes.string,
		sectionName: PropTypes.string,
		colorScheme: PropTypes.string,
		isGravatarDomain: PropTypes.bool,
	};

	constructor( props ) {
		super( props );
		this.state = {
			isDesktop: isWithinBreakpoint( '>=782px' ),
		};
	}

	componentDidMount() {
		this.unsubscribe = subscribeIsWithinBreakpoint( '>=782px', ( isDesktop ) => {
			this.setState( { isDesktop } );
		} );
	}

	render() {
		const sectionClass = clsx( 'layout', `focus-${ this.props.currentLayoutFocus }`, {
			[ 'is-group-' + this.props.sectionGroup ]: this.props.sectionGroup,
			[ 'is-section-' + this.props.sectionName ]: this.props.sectionName,
			crowdsignal: isCrowdsignalOAuth2Client( this.props.oauth2Client ),
			'is-support-session': this.props.isSupportSession,
			'has-universal-header': this.props.hasUniversalHeader,
			'is-logged-in': this.props.isLoggedIn,
			'is-global-sidebar-visible': this.props.isGlobalSidebarVisible,
			'is-global-sidebar-collapsed': this.props.isGlobalSidebarCollapsed,
			'is-reader-msd-enabled': this.props.isMSDEnabledForReader,
		} );

		const shouldEnableCommandPalette =
			// There is a custom command palette in the "Switch site" page, so we disable it.
			config.isEnabled( 'yolo/command-palette' ) && this.props.currentRoute !== '/switch-site';

		return (
			<div className={ sectionClass }>
				<SidebarOverflowDelay layoutFocus={ this.props.currentLayoutFocus } />
				<DocumentHead />
				{ this.props.shouldQueryAllSites ? (
					<QuerySites allSites />
				) : (
					<QuerySites primaryAndRecent={ ! config.isEnabled( 'jetpack-cloud' ) } />
				) }
				<UserVerificationChecker />
				{ config.isEnabled( 'layout/guided-tours' ) && (
					<AsyncLoad require="calypso/layout/guided-tours" placeholder={ null } />
				) }
				<div className="layout__header-section">
					<AsyncLoad require="calypso/reader/components/header" placeholder={ null } />;
				</div>
				<div id="content" className="layout__content">
					<AsyncLoad
						require="calypso/components/global-notices"
						placeholder={ null }
						id="notices"
					/>

					<div id="secondary" className="layout__secondary" role="navigation">
						{ this.props.secondary }
					</div>
					{ this.props.beforePrimary }
					<div id="primary" className="layout__primary">
						{ this.props.primary }
					</div>
				</div>
				<AsyncLoad require="calypso/layout/community-translator" placeholder={ null } />
				{ 'development' === process.env.NODE_ENV && (
					<>
						<SympathyDevWarning />
						<AsyncLoad require="calypso/components/webpack-build-monitor" placeholder={ null } />
					</>
				) }
				{ config.isEnabled( 'layout/support-article-dialog' ) && (
					<AsyncLoad require="calypso/blocks/support-article-dialog" placeholder={ null } />
				) }
				{ config.isEnabled( 'cookie-banner' ) && (
					<AsyncLoad require="calypso/blocks/cookie-banner" placeholder={ null } />
				) }
				{ config.isEnabled( 'layout/app-banner' ) && (
					<AsyncLoad require="calypso/blocks/app-banner" placeholder={ null } />
				) }
				{ config.isEnabled( 'legal-updates-banner' ) && (
					<AsyncLoad require="calypso/blocks/legal-updates-banner" placeholder={ null } />
				) }

				{ shouldEnableCommandPalette && (
					<AsyncLoad require="calypso/layout/command-palette" placeholder={ null } />
				) }
			</div>
		);
	}
}

export default withCurrentRoute(
	connect( ( state, { currentSection, currentRoute, currentQuery, secondary } ) => {
		const sectionGroup = currentSection?.group ?? null;
		const sectionName = currentSection?.name ?? null;
		const siteId = getSelectedSiteId( state );
		const isMSDEnabledForReader = currentSection?.name === 'reader' && isReaderMSDEnabled( state );

		const sidebarType = getSidebarType( {
			state,
			siteId,
			section: currentSection,
			route: currentRoute,
		} );

		const shouldShowGlobalSidebar =
			sidebarType === SidebarType.Global || sidebarType === SidebarType.GlobalCollapsed;
		const shouldShowCollapsedGlobalSidebar = sidebarType === SidebarType.GlobalCollapsed;
		const shouldShowUnifiedSiteSidebar = sidebarType === SidebarType.UnifiedSiteClassic;

		const isFromAutomatticForAgenciesPlugin =
			'automattic-for-agencies-client' === currentQuery?.from;

		const isJetpackMobileFlow = 'jetpack-connect' === sectionName && !! retrieveMobileRedirect();
		const oauth2Client = getCurrentOAuth2Client( state );
		const wccomFrom = currentQuery?.[ 'wccom-from' ];
		const sidebarIsHidden = ! secondary || isWcMobileApp();
		const isGlobalSidebarVisible = shouldShowGlobalSidebar && ! sidebarIsHidden;

		const isLoggedIn = isUserLoggedIn( state );

		return {
			sidebarIsHidden,
			isJetpackMobileFlow,
			isFromAutomatticForAgenciesPlugin,
			isMSDEnabledForReader,
			oauth2Client,
			wccomFrom,
			isLoggedIn,
			isSupportSession: isSupportSession( state ),
			sectionGroup,
			sectionName,
			currentLayoutFocus: getCurrentLayoutFocus( state ),
			siteId,
			currentRoute,
			isGlobalSidebarVisible,
			isGlobalSidebarCollapsed: shouldShowCollapsedGlobalSidebar && ! sidebarIsHidden,
			isUnifiedSiteSidebarVisible: shouldShowUnifiedSiteSidebar && ! sidebarIsHidden,
		};
	} )( Layout )
);
