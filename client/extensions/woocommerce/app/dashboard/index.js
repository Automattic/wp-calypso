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
import {
	areSetupChoicesLoading,
	getFinishedInitialSetup,
	getSetStoreAddressDuringInitialSetup
} from 'woocommerce/state/sites/setup-choices/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Main from 'components/main';
import ManageNoOrdersView from './manage-no-orders-view';
import ManageOrdersView from './manage-orders-view';
import PreSetupView from './pre-setup-view';
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
		const { finishedInitialSetup, hasOrders, selectedSite, setStoreAddressDuringInitialSetup } = this.props;

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
		setStoreAddressDuringInitialSetup: getSetStoreAddressDuringInitialSetup( state ),
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
