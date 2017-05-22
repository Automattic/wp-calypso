/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getSelectedSite } from 'state/ui/selectors';
import Main from 'components/main';
import Manage from './manage';
import Setup from './setup';

class Dashboard extends Component {

	static propTypes = {
		className: PropTypes.string,
	};

	onStoreSetupFinished = () => {
		// TODO - save that setup has been finished to the store's state on WPCOM
		// TODO - is there a way to set an option on the store site?
	}

	render = () => {
		const { selectedSite, storeSetupCompleted } = this.props;

		return (
			<Main className={ classNames( 'dashboard', this.props.className ) }>
				{
					storeSetupCompleted && <Manage site={ selectedSite } /> ||
					<Setup onFinished={ this.onStoreSetupFinished } site={ selectedSite } />
				}
			</Main>
		);
	}

}

function mapStateToProps( state ) {
	// TODO - figure out from state if setup has been completed for this store yet

	return {
		selectedSite: getSelectedSite( state ),
		storeSetupCompleted: true, // false,
	};
}

export default connect( mapStateToProps )( localize( Dashboard ) );
