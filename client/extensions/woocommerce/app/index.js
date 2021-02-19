/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { areAllRequiredPluginsActive } from 'woocommerce/state/selectors/plugins';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import hasSitePendingAutomatedTransfer from 'calypso/state/selectors/has-site-pending-automated-transfer';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { Card } from '@automattic/components';
import config from '@automattic/calypso-config';
import DocumentHead from 'calypso/components/data/document-head';
import { fetchSetupChoices } from 'woocommerce/state/sites/setup-choices/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getSiteHomeUrl } from 'calypso/state/sites/selectors';
import { isLoaded as arePluginsLoaded } from 'calypso/state/plugins/installed/selectors';
import { isStoreSetupComplete } from 'woocommerce/state/sites/setup-choices/selectors';
import Main from 'calypso/components/main';
import Placeholder from './dashboard/placeholder';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import RequiredPluginsInstallView from 'woocommerce/app/dashboard/required-plugins-install-view';
import WooCommerceColophon from 'woocommerce/components/woocommerce-colophon';

class App extends Component {
	static propTypes = {
		allRequiredPluginsActive: PropTypes.bool,
		analyticsPath: PropTypes.string,
		analyticsTitle: PropTypes.string,
		canUserManageOptions: PropTypes.bool.isRequired,
		children: PropTypes.element.isRequired,
		documentTitle: PropTypes.string,
		fetchSetupChoices: PropTypes.func.isRequired,
		hasPendingAutomatedTransfer: PropTypes.bool.isRequired,
		isAtomicSite: PropTypes.bool.isRequired,
		isDashboard: PropTypes.bool.isRequired,
		pluginsLoaded: PropTypes.bool.isRequired,
		siteHomeUrl: PropTypes.string.isRequired,
		siteId: PropTypes.number,
		translate: PropTypes.func.isRequired,
	};

	componentDidMount() {
		this.fetchData( this.props );
	}

	UNSAFE_componentWillReceiveProps( newProps ) {
		if ( this.props.children !== newProps.children ) {
			window.scrollTo( 0, 0 );
		}
	}

	componentDidUpdate( prevProps ) {
		const { allRequiredPluginsActive, pluginsLoaded, siteId } = this.props;
		const oldSiteId = prevProps.siteId ? prevProps.siteId : null;

		// If the site has changed, or plugin status has changed, re-fetch data
		if (
			siteId !== oldSiteId ||
			prevProps.allRequiredPluginsActive !== allRequiredPluginsActive ||
			prevProps.pluginsLoaded !== pluginsLoaded
		) {
			this.fetchData( this.props );
		}
	}

	fetchData( { siteId } ) {
		if ( ! siteId ) {
			return;
		}

		this.props.fetchSetupChoices( siteId );
	}

	redirect() {
		window.location.href = this.props.siteHomeUrl;
	}

	renderPlaceholder() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		if ( this.props.isDashboard ) {
			return (
				<Main className="dashboard" wideLayout>
					<Placeholder />
				</Main>
			);
		}

		return (
			<Main className="woocommerce__placeholder" wideLayout>
				<Card className="woocommerce__placeholder-card" />
			</Main>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	maybeRenderChildren() {
		const {
			allRequiredPluginsActive,
			children,
			isDashboard,
			isSetupComplete,
			pluginsLoaded,
		} = this.props;
		if ( ! pluginsLoaded ) {
			return this.renderPlaceholder();
		}

		// Pass through to the dashboard when setup isn't completed
		if ( isDashboard && ! isSetupComplete ) {
			return children;
		}

		if ( pluginsLoaded && ! allRequiredPluginsActive ) {
			return <RequiredPluginsInstallView fixMode skipConfirmation />;
		}

		return children;
	}

	render = () => {
		const {
			analyticsPath,
			analyticsTitle,
			canUserManageOptions,
			hasPendingAutomatedTransfer,
			isAtomicSite,
			siteId,
			translate,
		} = this.props;
		if ( ! siteId ) {
			return null;
		}

		if (
			! isAtomicSite &&
			! hasPendingAutomatedTransfer &&
			! config.isEnabled( 'woocommerce/store-on-non-atomic-sites' )
		) {
			this.redirect();
			return null;
		}

		if ( ! canUserManageOptions ) {
			this.redirect();
			return null;
		}

		const documentTitle = this.props.documentTitle || translate( 'Store' );

		const className = 'woocommerce';
		return (
			<div className={ className }>
				<PageViewTracker path={ analyticsPath } title={ analyticsTitle } />
				<DocumentHead title={ documentTitle } />
				<QueryJetpackPlugins siteIds={ [ siteId ] } />
				{ this.maybeRenderChildren() }
				<WooCommerceColophon />
			</div>
		);
	};
}

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	const canUserManageOptions = canCurrentUser( state, siteId, 'manage_options' );
	const isAtomicSite = !! isSiteAutomatedTransfer( state, siteId );
	const hasPendingAutomatedTransfer = !! hasSitePendingAutomatedTransfer( state, siteId );

	const pluginsLoaded = arePluginsLoaded( state, siteId );
	const allRequiredPluginsActive = areAllRequiredPluginsActive( state, siteId );

	const isSetupComplete = isStoreSetupComplete( state, siteId );

	return {
		allRequiredPluginsActive,
		canUserManageOptions: siteId ? canUserManageOptions : false,
		isAtomicSite: siteId ? isAtomicSite : false,
		isSetupComplete,
		hasPendingAutomatedTransfer: siteId ? hasPendingAutomatedTransfer : false,
		pluginsLoaded,
		siteHomeUrl: getSiteHomeUrl( state, siteId ),
		siteId,
	};
}

export default connect( mapStateToProps, { fetchSetupChoices } )( localize( App ) );
