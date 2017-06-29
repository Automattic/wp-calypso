/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
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
} from 'woocommerce/state/sites/setup-choices/selectors';
import { areOrdersLoading, getOrders } from 'woocommerce/state/sites/orders/selectors';
import { fetchOrders } from 'woocommerce/state/sites/orders/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import ManageNoOrdersView from './manage-no-orders-view';
import ManageOrdersView from './manage-orders-view';
import PreSetupView from './pre-setup-view';
import RequiredPluginsInstallView from './required-plugins-install-view';
import SetupTasksView from './setup-tasks-view';

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
		fetchOrders: PropTypes.func,
		fetchSetupChoices: PropTypes.func,
	};

	componentDidMount = () => {
		const { selectedSite } = this.props;

		if ( selectedSite && selectedSite.ID ) {
			this.props.fetchSetupChoices( selectedSite.ID );
			this.props.fetchOrders( selectedSite.ID, 1 );
		}
	}

	componentWillReceiveProps = ( newProps ) => {
		const { selectedSite } = this.props;

		const newSiteId = newProps.selectedSite ? newProps.selectedSite.ID : null;
		const oldSiteId = selectedSite ? selectedSite.ID : null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchSetupChoices( newSiteId );
			this.props.fetchOrders( newSiteId, 1 );
		}
	}

	getBreadcrumb = () => {
		const {
			finishedInstallOfRequiredPlugins,
			finishedInitialSetup,
			setStoreAddressDuringInitialSetup,
			translate
		} = this.props;

		if ( ! finishedInstallOfRequiredPlugins ) {
			return translate( 'Installing Plugins' );
		}

		if ( ! setStoreAddressDuringInitialSetup ) {
			return translate( 'Store Location' );
		}

		if ( ! finishedInitialSetup ) {
			return translate( 'Store Setup' );
		}

		return translate( 'Dashboard' );
	}

	renderDashboardContent = () => {
		const {
			finishedInstallOfRequiredPlugins,
			finishedInitialSetup,
			hasOrders,
			selectedSite,
			setStoreAddressDuringInitialSetup,
		} = this.props;

		if ( ! finishedInstallOfRequiredPlugins ) {
			return ( <RequiredPluginsInstallView site={ selectedSite } /> );
		}

		if ( ! setStoreAddressDuringInitialSetup ) {
			return ( <PreSetupView site={ selectedSite } /> );
		}

		if ( ! finishedInitialSetup ) {
			return ( <SetupTasksView onFinished={ this.onStoreSetupFinished } site={ selectedSite } /> );
		}

		if ( ! hasOrders ) {
			return ( <ManageNoOrdersView site={ selectedSite } /> );
		}

		return ( <ManageOrdersView site={ selectedSite } /> );
	}

	render = () => {
		const { className, loading, selectedSite } = this.props;

		if ( loading || ! selectedSite ) {
			// TODO have a placeholder/loading view instead
			return null;
		}

		return (
			<Main className={ classNames( 'dashboard', className ) }>
				<ActionHeader breadcrumbs={ this.getBreadcrumb() } />
				{ this.renderDashboardContent() }
			</Main>
		);
	}

}

function mapStateToProps( state ) {
	const selectedSite = getSelectedSiteWithFallback( state );
	const loading = ( areOrdersLoading( state ) || areSetupChoicesLoading( state ) );
	const hasOrders = getOrders( state ).length > 0;
	const finishedInitialSetup = getFinishedInitialSetup( state );
	return {
		finishedInitialSetup,
		finishedInstallOfRequiredPlugins: getFinishedInstallOfRequiredPlugins( state ),
		hasOrders,
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
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( Dashboard ) );
