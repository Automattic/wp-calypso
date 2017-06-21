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
import { areOrdersLoading, getOrders } from 'woocommerce/state/sites/orders/selectors';
import { areSetupChoicesLoading, getFinishedInitialSetup } from 'woocommerce/state/sites/setup-choices/selectors';
import { fetchOrders } from 'woocommerce/state/sites/orders/actions';
import { fetchSetupChoices } from 'woocommerce/state/sites/setup-choices/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import ManageNoOrdersView from './manage-no-orders-view';
import ManageOrdersView from './manage-orders-view';
import SetupTasksView from './setup-tasks-view';

class Dashboard extends Component {

	static propTypes = {
		className: PropTypes.string,
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

	renderDashboardContent = () => {
		const { finishedInitialSetup, hasOrders, selectedSite } = this.props;

		if ( finishedInitialSetup && hasOrders ) {
			return ( <ManageOrdersView site={ selectedSite } /> );
		}

		if ( finishedInitialSetup && ! hasOrders ) {
			return ( <ManageNoOrdersView site={ selectedSite } /> );
		}

		return ( <SetupTasksView site={ selectedSite } /> );
	}

	render = () => {
		const { className, loading, selectedSite } = this.props;

		if ( loading || ! selectedSite ) {
			// TODO have a placeholder/loading view instead
			return null;
		}

		return (
			<Main className={ classNames( 'dashboard', className ) }>
				{ this.renderDashboardContent() }
			</Main>
		);
	}

}

function mapStateToProps( state ) {
	let finishedInitialSetup = false;
	let hasOrders = false;
	let loading = true;
	const selectedSite = getSelectedSiteWithFallback( state );

	if ( selectedSite ) {
		loading = areOrdersLoading( state, 1, selectedSite.ID ) || areSetupChoicesLoading( state, selectedSite.ID );
	}

	if ( ! loading ) {
		hasOrders = Boolean( getOrders( state ) );
		finishedInitialSetup = getFinishedInitialSetup( state );
	}

	return {
		finishedInitialSetup,
		hasOrders,
		loading,
		selectedSite,
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
