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
import { fetchSetupChoices } from 'woocommerce/state/sites/setup-choices/actions';
import { areSetupChoicesLoading, getFinishedInitialSetup } from 'woocommerce/state/sites/setup-choices/selectors';
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
		}
	}

	componentWillReceiveProps = ( newProps ) => {
		const { selectedSite } = this.props;

		const newSiteId = newProps.selectedSite && newProps.selectedSite.ID || null;
		const oldSiteId = selectedSite && selectedSite.ID || null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchSetupChoices( newSiteId );
		}
	}

	onStoreSetupFinished = () => {
		// TODO - save that setup has been finished to the store's state on WPCOM
	}

	renderDashboardContent = () => {
		const { finishedInitialSetup, hasOrders, selectedSite } = this.props;

		if ( finishedInitialSetup && hasOrders ) {
			return ( <ManageOrdersView site={ selectedSite } /> );
		}

		if ( finishedInitialSetup && ! hasOrders ) {
			return ( <ManageNoOrdersView site={ selectedSite } /> );
		}

		return ( <SetupTasksView onFinished={ this.onStoreSetupFinished } site={ selectedSite } /> );
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
	return {
		finishedInitialSetup: getFinishedInitialSetup( state ),
		hasOrders: false, // TODO - connect to a selector when it becomes available
		loading: areSetupChoicesLoading( state ),
		selectedSite: getSelectedSiteWithFallback( state ),
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchSetupChoices,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( Dashboard ) );
