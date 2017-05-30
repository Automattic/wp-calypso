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
import Card from 'components/card';
import { getSelectedSite } from 'state/ui/selectors';
import Main from 'components/main';
import Setup from './setup';

class Dashboard extends Component {

	static propTypes = {
		className: PropTypes.string,
	};

	onStoreSetupFinished = () => {
		// TODO - save that setup has been finished to the store's state on WPCOM
		// TODO - is there a way to set an option on the store site?
	}

	renderStoreSetup = () => {
		const { selectedSite } = this.props;
		return (
			<Setup
				onFinished={ this.onStoreSetupFinished }
				site={ selectedSite }
			/>
		);
	}

	renderStoreManagement = () => {
		const { translate } = this.props;

		return (
			<Card>
				<p>
					{ translate( 'This is the start of something great!' ) }
				</p>
				<p>
					{ translate( 'This will be the home for your WooCommerce Store integration with WordPress.com.' ) }
				</p>
			</Card>
		);
	}

	render = () => {
		const { storeSetupCompleted } = this.props;

		return (
			<Main className={ classNames( 'dashboard', this.props.className ) }>
				{ storeSetupCompleted ? this.renderStoreManagement() : this.renderStoreSetup() }
			</Main>
		);
	}

}

function mapStateToProps( state ) {
	// TODO - figure out from state if setup has been completed for this store yet

	return {
		selectedSite: getSelectedSite( state ),
		storeSetupCompleted: false,
	};
}

export default connect( mapStateToProps )( localize( Dashboard ) );
