/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import PlansGrid from './plans-grid';
import PlansSkipButton from './plans-skip-button';
import { abtest } from 'lib/abtest';
import { recordTracksEvent } from 'state/analytics/actions';
import { selectPlanInAdvance } from 'state/jetpack-connect/actions';
import { getJetpackSiteByUrl } from 'state/jetpack-connect/selectors';
import { getSite } from 'state/sites/selectors';
import QueryPlans from 'components/data/query-plans';
import addQueryArgs from 'lib/route/add-query-args';

const CALYPSO_JETPACK_CONNECT = '/jetpack/connect';

class PlansLanding extends Component {
	static propTypes = {
		basePlansPath: PropTypes.string,
		interval: PropTypes.string,
		url: PropTypes.string,
	};

	static defaultProps = {
		url: '',
	};

	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_jpc_plans_landing_view', {
			jpc_from: 'jetpack',
		} );

		this.goToPlansIfAlreadyConnected();
	}

	componentDidUpdate() {
		this.goToPlansIfAlreadyConnected();
	}

	goToPlansIfAlreadyConnected() {
		const { site } = this.props;

		if ( site ) {
			page.redirect( '/plans/' + site.slug );
		}
	}

	storeSelectedPlan = ( cartItem ) => {
		const { url } = this.props;
		let redirectUrl = CALYPSO_JETPACK_CONNECT;

		if ( url ) {
			redirectUrl = addQueryArgs( { url }, redirectUrl );
		}

		this.props.recordTracksEvent( 'calypso_jpc_plans_store_plan', {
			plan: cartItem ? cartItem.product_slug : 'free'
		} );
		this.props.selectPlanInAdvance( cartItem ? cartItem.product_slug : 'free', '*' );

		setTimeout( () => {
			page.redirect( redirectUrl );
		}, 25 );
	};

	handleSkipButtonClick = () => {
		this.props.recordTracksEvent( 'calypso_jpc_plans_skip_button_click' );

		this.storeSelectedPlan( null );
	};

	render() {
		const {
			basePlansPath,
			interval,
		} = this.props;
		const hideFreePlanTest = abtest( 'jetpackConnectHideFreePlan' ) === 'hide';

		return (
			<div>
				<QueryPlans />

				<PlansGrid
					basePlansPath={ basePlansPath }
					calypsoStartedConnection={ true }
					hideFreePlan={ hideFreePlanTest }
					interval={ interval }
					isLanding={ true }
					onSelect={ this.storeSelectedPlan }
				>
					{
						hideFreePlanTest &&
						<PlansSkipButton onClick={ this.handleSkipButtonClick } />
					}
				</PlansGrid>
			</div>
		);
	}
}

export default connect(
	( state, { url } ) => {
		const rawSite = url ? getJetpackSiteByUrl( state, url ) : null;
		const site = rawSite ? getSite( state, rawSite.ID ) : null;

		return {
			site,
		};
	},
	{
		recordTracksEvent,
		selectPlanInAdvance,
	}
)( PlansLanding );
