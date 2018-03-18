/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get, isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import {
	areSettingsGeneralLoading,
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';
import {
	areSetupChoicesLoading,
	getFinishedInitialSetup,
	getSetStoreAddressDuringInitialSetup,
	getFinishedInstallOfRequiredPlugins,
	getFinishedPageSetup,
	isStoreSetupComplete,
} from 'woocommerce/state/sites/setup-choices/selectors';
import {
	areOrdersLoading,
	getNewOrdersWithoutPayPalPending,
} from 'woocommerce/state/sites/orders/selectors';
import { fetchOrders } from 'woocommerce/state/sites/orders/actions';
import { fetchProducts } from 'woocommerce/state/sites/products/actions';
import { requestSettings } from 'woocommerce/state/sites/settings/mailchimp/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import {
	getTotalProducts,
	areProductsLoading,
	areProductsLoaded,
} from 'woocommerce/state/sites/products/selectors';
import { isStoreManagementSupportedInCalypsoForCountry } from 'woocommerce/lib/countries';
import Main from 'components/main';
import ManageExternalView from './manage-external-view';
import ManageNoOrdersView from './manage-no-orders-view';
import ManageOrdersView from './manage-orders-view';
import Placeholder from './placeholder';
import StoreLocationSetupView from './setup/store-location';
import RequiredPagesSetupView from './required-pages-setup-view';
import RequiredPluginsInstallView from './required-plugins-install-view';
import SetupTasksView from './setup';
import MailChimp from 'woocommerce/app/settings/email/mailchimp/index.js';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';
import warn from 'lib/warn';

class Dashboard extends Component {
	static propTypes = {
		className: PropTypes.string,
		finishedInitialSetup: PropTypes.bool,
		hasOrders: PropTypes.bool,
		isSetupComplete: PropTypes.bool,
		loading: PropTypes.bool,
		selectedSite: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
			URL: PropTypes.string.isRequired,
		} ),
		siteId: PropTypes.number,
		mailChimpConfigured: PropTypes.bool,
		fetchOrders: PropTypes.func,
		requestSyncStatus: PropTypes.func,
		setupChoicesLoading: PropTypes.bool,
	};

	state = {
		redirectURL: false,
	};

	componentDidMount() {
		const { siteId } = this.props;

		if ( siteId ) {
			this.fetchStoreData();
		}
	}

	componentDidUpdate( prevProps ) {
		const { siteId } = this.props;
		const oldSiteId = prevProps.siteId ? prevProps.siteId : null;

		if ( siteId && oldSiteId !== siteId ) {
			this.fetchStoreData();
		}
	}

	// If the user 1) has set the store address in StoreLocationSetupView
	// and 2) we have a redirectURL, don't render but go ahead and
	// redirect (i.e. to the WooCommerce Setup Wizard in wp-admin)
	shouldComponentUpdate( nextProps, nextState ) {
		const { setStoreAddressDuringInitialSetup } = nextProps;
		const { redirectURL } = nextState;

		if ( setStoreAddressDuringInitialSetup && redirectURL ) {
			window.location = redirectURL;
			return false;
		}

		return true;
	}

	fetchStoreData = () => {
		const { siteId, productsLoaded } = this.props;
		this.props.fetchOrders( siteId );
		this.props.requestSettings( siteId );

		if ( ! productsLoaded ) {
			const params = { page: 1 };
			this.props.fetchProducts( siteId, params, null, null );
		}
	};

	getBreadcrumb = () => {
		const {
			finishedInstallOfRequiredPlugins,
			finishedPageSetup,
			finishedInitialSetup,
			setStoreAddressDuringInitialSetup,
			translate,
			hasProducts,
		} = this.props;

		if ( ! finishedInstallOfRequiredPlugins ) {
			return translate( 'Store' );
		}

		if ( ! finishedPageSetup && ! hasProducts ) {
			return translate( 'Setting Up Store Pages' );
		}

		if ( ! setStoreAddressDuringInitialSetup ) {
			return translate( 'Store Location' );
		}

		if ( ! finishedInitialSetup ) {
			return translate( 'Store Setup' );
		}

		return translate( 'Dashboard' );
	};

	onRequestRedirect = redirectURL => {
		this.setState( { redirectURL } );
	};

	renderDashboardSetupContent = () => {
		const {
			finishedInstallOfRequiredPlugins,
			finishedPageSetup,
			hasProducts,
			selectedSite,
			setStoreAddressDuringInitialSetup,
			setupChoicesLoading,
			settingsGeneralLoading,
			storeLocation,
		} = this.props;

		const adminURL = get( selectedSite, 'options.admin_url', '' );
		if ( isEmpty( adminURL ) ) {
			warn( 'options.admin_url unexpectedly empty in renderDashboardSetupContent' );
		}

		if ( setupChoicesLoading ) {
			// Many of the clauses below depend on setup choices being in the state tree
			// Show a placeholder while they load
			return <Placeholder />;
		}

		if ( ! finishedInstallOfRequiredPlugins ) {
			return <RequiredPluginsInstallView site={ selectedSite } />;
		}

		if ( ! finishedPageSetup && ! hasProducts ) {
			return <RequiredPagesSetupView site={ selectedSite } />;
		}

		if ( ! setStoreAddressDuringInitialSetup ) {
			return (
				<StoreLocationSetupView
					adminURL={ adminURL }
					onRequestRedirect={ this.onRequestRedirect }
					siteId={ selectedSite.ID }
					pushDefaultsForCountry={ ! hasProducts }
				/>
			);
		}

		// At this point, we don't know what we want to render until
		// we know the store's country (from settings general)
		if ( settingsGeneralLoading ) {
			return <Placeholder />;
		}

		// Not a supported country? Hold off on the setup tasks view until
		// the country gains support - then the merchant will be able to complete
		// tasks (or skip them)
		const storeCountry = get( storeLocation, 'country' );
		const manageInCalypso = isStoreManagementSupportedInCalypsoForCountry( storeCountry );
		if ( ! manageInCalypso ) {
			return <ManageExternalView site={ selectedSite } />;
		}

		return <SetupTasksView onFinished={ this.onStoreSetupFinished } site={ selectedSite } />;
	};

	renderDashboardContent = () => {
		const { hasOrders, loading, selectedSite, storeLocation } = this.props;

		if ( loading || ! selectedSite ) {
			return <Placeholder />;
		}

		let manageView = null;
		const storeCountry = get( storeLocation, 'country' );
		const manageInCalypso = isStoreManagementSupportedInCalypsoForCountry( storeCountry );
		if ( manageInCalypso ) {
			if ( hasOrders ) {
				manageView = <ManageOrdersView site={ selectedSite } />;
			} else {
				manageView = <ManageNoOrdersView site={ selectedSite } />;
			}
		} else {
			manageView = <ManageExternalView site={ selectedSite } />;
		}

		return (
			<div>
				{ manageView }
				{ ! this.props.mailChimpConfigured &&
					manageInCalypso && <MailChimp site={ selectedSite } redirectToSettings dashboardView /> }
			</div>
		);
	};

	render() {
		const { className, isSetupComplete, loading, selectedSite, siteId } = this.props;

		return (
			<Main className={ classNames( 'dashboard', className ) } wideLayout>
				<ActionHeader
					breadcrumbs={ this.getBreadcrumb() }
					isLoading={ loading || ! selectedSite }
				/>
				{ isSetupComplete ? this.renderDashboardContent() : this.renderDashboardSetupContent() }
				<QuerySettingsGeneral siteId={ siteId } />
			</Main>
		);
	}
}

function mapStateToProps( state ) {
	const selectedSite = getSelectedSiteWithFallback( state );
	const siteId = selectedSite ? selectedSite.ID : null;
	const setupChoicesLoading = areSetupChoicesLoading( state );
	const settingsGeneralLoading = areSettingsGeneralLoading( state, siteId );
	const loading =
		areOrdersLoading( state ) ||
		setupChoicesLoading ||
		areProductsLoading( state ) ||
		settingsGeneralLoading;
	const hasOrders = getNewOrdersWithoutPayPalPending( state ).length > 0;
	const hasProducts = getTotalProducts( state ) > 0;
	const productsLoaded = areProductsLoaded( state );
	const finishedInitialSetup = getFinishedInitialSetup( state );
	const finishedInstallOfRequiredPlugins = getFinishedInstallOfRequiredPlugins( state );
	const finishedPageSetup = getFinishedPageSetup( state );
	const setStoreAddressDuringInitialSetup = getSetStoreAddressDuringInitialSetup( state );
	const isSetupComplete = isStoreSetupComplete( state );
	const storeLocation = getStoreLocation( state, siteId );

	return {
		finishedInitialSetup,
		finishedInstallOfRequiredPlugins,
		finishedPageSetup,
		hasOrders,
		hasProducts,
		isSetupComplete,
		loading,
		productsLoaded,
		selectedSite,
		setStoreAddressDuringInitialSetup,
		settingsGeneralLoading,
		setupChoicesLoading,
		siteId,
		storeLocation,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchOrders,
			fetchProducts,
			requestSettings,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( Dashboard ) );
