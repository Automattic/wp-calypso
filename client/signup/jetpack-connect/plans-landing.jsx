/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React from 'react';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import PlansGrid from './plans-grid';
import { recordTracksEvent } from 'state/analytics/actions';
import { selectPlanInAdvance } from 'state/jetpack-connect/actions';
import QueryPlans from 'components/data/query-plans';

const CALYPSO_JETPACK_CONNECT = '/jetpack/connect';

const PlansLanding = React.createClass( {

	propTypes: {
		sites: React.PropTypes.object,
		sitePlans: React.PropTypes.object.isRequired,
		intervalType: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			intervalType: 'yearly',
			siteSlug: '*'
		};
	},

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_jpc_plans_landing_view', {
			jpc_from: this.props.landingType
		} );
	},

	storeSelectedPlan( cartItem ) {
		this.props.recordTracksEvent( 'calypso_jpc_plans_store_plan', {
			plan: cartItem ? cartItem.product_slug : 'free'
		} );
		this.props.selectPlanInAdvance(	cartItem ? cartItem.product_slug : 'free', '*', );

		setTimeout( () => {
			page.redirect( CALYPSO_JETPACK_CONNECT );
		}, 25 );
	},

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
} );

export default connect(
	() => {
		return {
			sitePlans: {},
			calypsoStartedConnection: true
		};
	},
	( dispatch ) => {
		return Object.assign( {},
			bindActionCreators( { selectPlanInAdvance }, dispatch ),
			{
				recordTracksEvent( eventName, props ) {
					dispatch( recordTracksEvent( eventName, props ) );
				}
			}
		);
	}
)( PlansLanding );
