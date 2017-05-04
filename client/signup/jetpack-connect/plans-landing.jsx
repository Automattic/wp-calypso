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
		intervalType: PropTypes.string,
		landingType: PropTypes.string,
		sitePlans: PropTypes.object.isRequired,
		sites: PropTypes.object,
	};

	static defaultProps = {
		intervalType: 'yearly',
		siteSlug: '*',
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_jpc_plans_landing_view', {
			jpc_from: this.props.landingType
		} );
	}

	storeSelectedPlan = ( cartItem ) => {
		this.props.recordTracksEvent( 'calypso_jpc_plans_store_plan', {
			plan: cartItem ? cartItem.product_slug : 'free'
		} );
		this.props.selectPlanInAdvance(	cartItem ? cartItem.product_slug : 'free', '*', );

		setTimeout( () => {
			page.redirect( CALYPSO_JETPACK_CONNECT );
		}, 25 );
	}

	render() {
		return (
			<div>
				<QueryPlans />
				<PlansGrid { ...this.props }
					onSelect={ this.storeSelectedPlan }
					basePlansPath={ this.props.basePlansPath } />
			</div>
		);
	}
}

export default connect(
	() => {
		return {
			sitePlans: {},
			calypsoStartedConnection: true
		};
	},
	{
		recordTracksEvent,
		selectPlanInAdvance,
	}
)( PlansLanding );
