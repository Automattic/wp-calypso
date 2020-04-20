/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { get, isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import {
	areCountsLoaded,
	getCountNewOrders,
	getCountProducts,
} from 'woocommerce/state/sites/data/counts/selectors';
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
import { fetchCounts } from 'woocommerce/state/sites/data/counts/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { isStoreManagementSupportedInCalypsoForCountry } from 'woocommerce/lib/countries';
import Main from 'components/main';
import ManageExternalView from './manage-external-view';
import ManageNoOrdersView from './manage-no-orders-view';
import ManageOrdersView from './manage-orders-view';
import Placeholder from './placeholder';
import RequiredPagesSetupView from './required-pages-setup-view';
import RequiredPluginsInstallView from './required-plugins-install-view';
import SetupTasksView from './setup';
import StoreLocationSetupView from './setup/store-location';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';
import warn from 'lib/warn';

class Dashboard extends Component {
	static propTypes = {
		className: PropTypes.string,
		fetchCounts: PropTypes.func,
		finishedInitialSetup: PropTypes.bool,
		finishedInstallOfRequiredPlugins: PropTypes.bool,
		finishedPageSetup: PropTypes.bool,
		hasCounts: PropTypes.bool,
		hasOrders: PropTypes.bool,
		hasProducts: PropTypes.bool,
		isSetupComplete: PropTypes.bool,
		loading: PropTypes.bool,
		selectedSite: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
			URL: PropTypes.string.isRequired,
		} ),
		setStoreAddressDuringInitialSetup: PropTypes.bool,
		settingsGeneralLoading: PropTypes.bool,
		setupChoicesLoading: PropTypes.bool,
		siteId: PropTypes.number,
		storeLocation: PropTypes.object,
	};

	state = {
		redirectURL: false,
	};

	componentDidMount() {
		const { siteId } = this.props;

		if ( siteId ) {
			this.fetchData();
		}
	}

	componentDidUpdate( prevProps ) {
		const { siteId } = this.props;
		const oldSiteId = prevProps.siteId ? prevProps.siteId : null;

		if ( siteId && oldSiteId !== siteId ) {
			this.fetchData();
		}
	}

	fetchData = () => {
		const { siteId, hasCounts } = this.props;
		if ( ! hasCounts ) {
			this.props.fetchCounts( siteId );
		}
	};

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
		const { finishedInstallOfRequiredPlugins, hasCounts, siteId } = this.props;

		if ( ! finishedInstallOfRequiredPlugins ) {
			return;
		}

		if ( ! hasCounts ) {
			this.props.fetchCounts( siteId );
		}
	};

	getBreadcrumb = () => {
		const {
			finishedInitialSetup,
			finishedInstallOfRequiredPlugins,
			finishedPageSetup,
			hasProducts,
			setStoreAddressDuringInitialSetup,
			translate,
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

	onRequestRedirect = ( redirectURL ) => {
		this.setState( { redirectURL } );
	};

	renderDashboardSetupContent = () => {
		const {
			finishedInstallOfRequiredPlugins,
			finishedPageSetup,
			hasProducts,
			selectedSite,
			setStoreAddressDuringInitialSetup,
			settingsGeneralLoading,
			setupChoicesLoading,
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

		return <div>{ manageView }</div>;
	};

	render() {
		const { className, finishedInstallOfRequiredPlugins, isSetupComplete, siteId } = this.props;
		const useWideLayout = isSetupComplete ? true : false;

		return (
			<Main className={ classNames( 'dashboard', className ) } wideLayout={ useWideLayout }>
				<ActionHeader breadcrumbs={ this.getBreadcrumb() } />
				{ isSetupComplete ? this.renderDashboardContent() : this.renderDashboardSetupContent() }
				{ finishedInstallOfRequiredPlugins && <QuerySettingsGeneral siteId={ siteId } /> }
			</Main>
		);
	}
}

function mapStateToProps( state ) {
	const selectedSite = getSelectedSiteWithFallback( state );
	const siteId = selectedSite ? selectedSite.ID : null;

	// Data from calypso-preferences
	const setupChoicesLoading = areSetupChoicesLoading( state );
	const finishedPageSetup = getFinishedPageSetup( state );
	const setStoreAddressDuringInitialSetup = getSetStoreAddressDuringInitialSetup( state );
	const isSetupComplete = isStoreSetupComplete( state );
	const finishedInitialSetup = getFinishedInitialSetup( state );
	const finishedInstallOfRequiredPlugins = getFinishedInstallOfRequiredPlugins( state );

	// Data from settings/general
	const settingsGeneralLoading = areSettingsGeneralLoading( state, siteId );
	const storeLocation = getStoreLocation( state, siteId );

	// Data from data/counts
	const hasCounts = areCountsLoaded( state );
	const hasOrders = getCountNewOrders( state ) > 0;
	const hasProducts = getCountProducts( state ) > 0;

	const loading = setupChoicesLoading || ! hasCounts || settingsGeneralLoading;

	return {
		finishedInitialSetup,
		finishedInstallOfRequiredPlugins,
		finishedPageSetup,
		hasCounts,
		hasOrders,
		hasProducts,
		isSetupComplete,
		loading,
		selectedSite,
		setStoreAddressDuringInitialSetup,
		settingsGeneralLoading,
		setupChoicesLoading,
		siteId,
		storeLocation,
	};
}

export default connect( mapStateToProps, { fetchCounts } )( localize( Dashboard ) );
