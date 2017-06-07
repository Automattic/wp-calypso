/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import PlansGrid from './plans-grid';
import { recordTracksEvent } from 'state/analytics/actions';
import { selectPlanInAdvance } from 'state/jetpack-connect/actions';
import QueryPlans from 'components/data/query-plans';

const CALYPSO_JETPACK_CONNECT = '/jetpack/connect';

class PlansLanding extends Component {
	static propTypes = {
		basePlansPath: PropTypes.string,
		interval: PropTypes.string,
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_jpc_plans_landing_view', {
			jpc_from: 'jetpack',
		} );
	}

	storeSelectedPlan = ( cartItem ) => {
		this.props.recordTracksEvent( 'calypso_jpc_plans_store_plan', {
			plan: cartItem ? cartItem.product_slug : 'free'
		} );
		this.props.selectPlanInAdvance( cartItem ? cartItem.product_slug : 'free', '*' );

		setTimeout( () => {
			page.redirect( CALYPSO_JETPACK_CONNECT );
		}, 25 );
	}

	render() {
		const {
			basePlansPath,
			interval,
		} = this.props;
		return (
			<div>
				<QueryPlans />

				<PlansGrid
					basePlansPath={ basePlansPath }
					calypsoStartedConnection={ true }
					hideFreePlan={ false }
					interval={ interval }
					isLanding={ true }
					onSelect={ this.storeSelectedPlan }
				/>
			</div>
		);
	}
}

export default connect( null, {
	recordTracksEvent,
	selectPlanInAdvance,
} )( PlansLanding );
