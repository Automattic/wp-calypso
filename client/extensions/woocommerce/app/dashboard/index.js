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
import { getSelectedSite } from 'state/ui/selectors';
import Main from 'components/main';
import Manage from './manage';
import Setup from './setup';

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

		const newSiteID = newProps.selectedSite && newProps.selectedSite.ID || null;
		const oldSiteID = selectedSite && selectedSite.ID || null;

		if ( oldSiteID !== newSiteID ) {
			this.props.fetchSetupChoices( newSiteID );
		}
	}

	onStoreSetupFinished = () => {
		// TODO - save that setup has been finished to the store's state on WPCOM
	}

	render = () => {
		const { finishedInitialSetup, loading, selectedSite } = this.props;

		if ( loading || ! selectedSite ) {
			// TODO have a placholder/loading view instead
			return null;
		}

		return (
			<Main className={ classNames( 'dashboard', this.props.className ) }>
				{
					finishedInitialSetup && <Manage site={ selectedSite } /> ||
					<Setup onFinished={ this.onStoreSetupFinished } site={ selectedSite } />
				}
			</Main>
		);
	}

}

function mapStateToProps( state ) {
	const finishedInitialSetup = getFinishedInitialSetup( state );
	const loading = areSetupChoicesLoading( state );
	const selectedSite = getSelectedSite( state );

	return {
		finishedInitialSetup,
		loading,
		selectedSite,
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
