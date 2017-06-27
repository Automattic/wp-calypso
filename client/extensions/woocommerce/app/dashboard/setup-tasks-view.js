/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import {
	getOptedOutOfShippingSetup,
	getOptedOutofTaxesSetup,
	getTriedCustomizerDuringInitialSetup,
} from 'woocommerce/state/sites/setup-choices/selectors';
import {
	setFinishedInitialSetup,
} from 'woocommerce/state/sites/setup-choices/actions';
import SetupFooter from './setup-footer';
import SetupHeader from './setup-header';
import SetupTasks from './setup-tasks';

class SetupTasksView extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
		} ),
	};

	onFinished = ( event ) => {
		event.preventDefault();
		analytics.tracks.recordEvent( 'calypso_woocommerce_dashboard_action_click', {
			action: 'finished',
		} );
		this.props.setFinishedInitialSetup( this.props.site.ID, true );
	}

	render = () => {
		const { allTasksCompleted, site, translate } = this.props;

		return (
			<div className="card dashboard__setup-wrapper">
				<SetupHeader
					imageSource={ '/calypso/images/extensions/woocommerce/woocommerce-setup.svg' }
					imageWidth={ 160 }
					title={ translate( 'Let\'s set up your store' ) }
					subtitle={ translate( 'Here are the things you’ll need to do before you can start taking orders.' ) }
				/>
				<SetupTasks
					site={ site }
				/>
				<SetupFooter
					onClick={ this.onFinished }
					label={ translate( 'I\'m finished setting up' ) }
					primary={ allTasksCompleted }
				/>
			</div>
		);
	}
}

function mapStateToProps( state ) {
	// TODO - add test for hasProducts, paymentsAreSetUp, shippingIsSetUp and taxesAreSetUp
	// when those selectors become available
	const allTasksCompleted = getOptedOutOfShippingSetup( state ) &&
		getOptedOutofTaxesSetup( state ) &&
		getTriedCustomizerDuringInitialSetup( state );

	return {
		allTasksCompleted,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			setFinishedInitialSetup,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( SetupTasksView ) );
