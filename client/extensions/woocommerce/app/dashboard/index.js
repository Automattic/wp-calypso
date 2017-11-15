/**
 * External dependencies
 *
 * @format
 */
import config from 'config';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import { fetchSetupChoices } from 'woocommerce/state/sites/setup-choices/actions';
import {
	areSetupChoicesLoading,
	getFinishedInitialSetup,
	getSetStoreAddressDuringInitialSetup,
	getFinishedInstallOfRequiredPlugins,
	getFinishedPageSetup,
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
import Main from 'components/main';
import ManageNoOrdersView from './manage-no-orders-view';
import ManageOrdersView from './manage-orders-view';
import PreSetupView from './pre-setup-view';
import RequiredPagesSetupView from './required-pages-setup-view';
import RequiredPluginsInstallView from './required-plugins-install-view';
import SetupTasksView from './setup-tasks-view';
import MailChimp from 'woocommerce/app/settings/email/mailchimp/index.js';

class Dashboard extends Component {
	static propTypes = {
		className: PropTypes.string,
		finishedInitialSetup: PropTypes.bool,
		hasOrders: PropTypes.bool,
		loading: PropTypes.bool,
		selectedSite: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
			URL: PropTypes.string.isRequired,
		} ),
		mailChimpConfigured: PropTypes.bool,
		fetchOrders: PropTypes.func,
		fetchSetupChoices: PropTypes.func,
		requestSyncStatus: PropTypes.func,
	};

	componentDidMount = () => {
		const { selectedSite, productsLoaded } = this.props;

		if ( selectedSite && selectedSite.ID ) {
			this.props.fetchSetupChoices( selectedSite.ID );
			this.props.fetchOrders( selectedSite.ID );
			this.props.requestSettings( selectedSite.ID );

			if ( ! productsLoaded ) {
				this.props.fetchProducts( selectedSite.ID, { page: 1 } );
			}
		}
	};

	componentWillReceiveProps = newProps => {
		const { selectedSite, productsLoaded } = this.props;

		const newSiteId = newProps.selectedSite ? newProps.selectedSite.ID : null;
		const oldSiteId = selectedSite ? selectedSite.ID : null;

		if ( newSiteId && oldSiteId !== newSiteId ) {
			this.props.fetchSetupChoices( newSiteId );
			this.props.fetchOrders( newSiteId );
			this.props.requestSettings( newSiteId );

			if ( ! productsLoaded ) {
				this.props.fetchProducts( newSiteId, { page: 1 } );
			}
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

		if ( ! setStoreAddressDuringInitialSetup && ! hasProducts ) {
			return translate( 'Store Location' );
		}

		if ( ! finishedInitialSetup ) {
			return translate( 'Store Setup' );
		}

		return translate( 'Dashboard' );
	};

	renderDashboardContent = () => {
		const {
			finishedInstallOfRequiredPlugins,
			finishedPageSetup,
			finishedInitialSetup,
			hasOrders,
			hasProducts,
			selectedSite,
			setStoreAddressDuringInitialSetup,
		} = this.props;

		// render should not be calling renderDashboardContent unless we have a site and ID,
		// but let's check anyways in case that should change externally
		if ( ! selectedSite || ! selectedSite.ID ) {
			return null;
		}

		if ( ! finishedInstallOfRequiredPlugins ) {
			return <RequiredPluginsInstallView site={ selectedSite } />;
		}

		if ( ! finishedPageSetup && ! hasProducts ) {
			return <RequiredPagesSetupView site={ selectedSite } />;
		}

		if ( ! setStoreAddressDuringInitialSetup && ! hasProducts ) {
			return <PreSetupView siteId={ selectedSite.ID } />;
		}

		if ( ! finishedInitialSetup ) {
			return <SetupTasksView onFinished={ this.onStoreSetupFinished } site={ selectedSite } />;
		}

		let manageView = <ManageOrdersView site={ selectedSite } />;
		if ( ! hasOrders ) {
			manageView = <ManageNoOrdersView site={ selectedSite } />;
		}

		return (
			<div>
				{ manageView }
				{ ! this.props.mailChimpConfigured &&
					( config.isEnabled( 'woocommerce/extension-settings-email' ) && (
						<MailChimp site={ selectedSite } redirectToSettings dashboardView />
					) ) }
			</div>
		);
	};

	render = () => {
		const { className, loading, selectedSite } = this.props;

		if ( loading || ! selectedSite ) {
			// TODO reintroduce placeholder after new nux flow is finalized.
			return null;
		}

		return (
			<Main className={ classNames( 'dashboard', className ) }>
				<ActionHeader
					breadcrumbs={ this.getBreadcrumb() }
					isLoading={ loading || ! selectedSite }
				/>
				{ this.renderDashboardContent() }
			</Main>
		);
	};
}

function mapStateToProps( state ) {
	const selectedSite = getSelectedSiteWithFallback( state );
	const loading =
		areOrdersLoading( state ) || areSetupChoicesLoading( state ) || areProductsLoading( state );
	const hasOrders = getNewOrdersWithoutPayPalPending( state ).length > 0;
	const hasProducts = getTotalProducts( state ) > 0;
	const productsLoaded = areProductsLoaded( state );
	const finishedInitialSetup = getFinishedInitialSetup( state );

	return {
		finishedInitialSetup,
		finishedInstallOfRequiredPlugins: getFinishedInstallOfRequiredPlugins( state ),
		finishedPageSetup: getFinishedPageSetup( state ),
		hasOrders,
		hasProducts,
		productsLoaded,
		loading,
		selectedSite,
		setStoreAddressDuringInitialSetup: getSetStoreAddressDuringInitialSetup( state ),
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchOrders,
			fetchSetupChoices,
			fetchProducts,
			requestSettings,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( Dashboard ) );
