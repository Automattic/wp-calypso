/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import page from 'page';
import { connect } from 'react-redux';
import { flowRight } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/route';
import DocumentHead from 'components/data/document-head';
import HelpButton from './help-button';
import JetpackConnectHappychatButton from './happychat-button';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import Placeholder from './plans-placeholder';
import PlansGrid from './plans-grid';
import QueryPlans from 'components/data/query-plans';
import { getJetpackSiteByUrl } from 'state/jetpack-connect/selectors';
import { getSite, isRequestingSites } from 'state/sites/selectors';
import { PLAN_JETPACK_FREE } from 'lib/plans/constants';
import { recordTracksEvent } from 'state/analytics/actions';
import { storePlan } from './persistence-utils';

const CALYPSO_JETPACK_CONNECT = '/jetpack/connect';

class PlansLanding extends Component {
	static propTypes = {
		interval: PropTypes.string,
		url: PropTypes.string,
	};

	static defaultProps = {
		url: '',
	};

	componentDidMount() {
		const { cta_id, cta_from } = this.props.context.query;
		this.props.recordTracksEvent( 'calypso_jpc_plans_landing_view', {
			jpc_from: 'jetpack',
			cta_id,
			cta_from,
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
			plan: cartItem ? cartItem.product_slug : 'free',
		} );

		storePlan( cartItem ? cartItem.product_slug : PLAN_JETPACK_FREE );

		setTimeout( () => {
			page.redirect( redirectUrl );
		}, 25 );
	};

	handleInfoButtonClick = ( info ) => () => {
		this.props.recordTracksEvent( 'calypso_jpc_external_help_click', {
			help_type: info,
		} );
	};

	render() {
		const { interval, requestingSites, site, translate, url } = this.props;

		// We're redirecting in componentDidMount if the site is already connected
		// so don't bother rendering any markup if this is the case
		if ( url && ( site || requestingSites ) ) {
			return <Placeholder />;
		}

		return (
			<Fragment>
				<DocumentHead title={ translate( 'Plans' ) } />
				<QueryPlans />
				<PlansGrid
					basePlansPath={ '/jetpack/connect/store' }
					calypsoStartedConnection={ true }
					hideFreePlan={ true }
					interval={ interval }
					isLanding={ true }
					onSelect={ this.storeSelectedPlan }
				>
					<LoggedOutFormLinks>
						<JetpackConnectHappychatButton eventName="calypso_jpc_planslanding_chat_initiated">
							<HelpButton />
						</JetpackConnectHappychatButton>
					</LoggedOutFormLinks>
				</PlansGrid>
			</Fragment>
		);
	}
}

const connectComponent = connect(
	( state, { url } ) => {
		const rawSite = url ? getJetpackSiteByUrl( state, url ) : null;
		const site = rawSite ? getSite( state, rawSite.ID ) : null;

		return {
			requestingSites: isRequestingSites( state ),
			site,
		};
	},
	{
		recordTracksEvent,
	}
);

export default flowRight( connectComponent, localize )( PlansLanding );
