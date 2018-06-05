/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StoreConnection from 'components/data/store-connection';
import CartStore from 'lib/cart/store';
import QueryProducts from 'components/data/query-products-list';
import QuerySites from 'components/data/query-sites';
import userFactory from 'lib/user';
import { fetchByDomain, fetchBySiteId } from 'state/google-apps-users/actions';
import { getByDomain, getBySite, isLoaded } from 'state/google-apps-users/selectors';
import { shouldFetchSitePlans } from 'lib/plans';
import { fetchSitePlans } from 'state/sites/plans/actions';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { getProductsList } from 'state/products-list/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getDomainsBySiteId, isRequestingSiteDomains } from 'state/sites/domains/selectors';
import QuerySiteDomains from 'components/data/query-site-domains';

const user = userFactory();

const stores = [ CartStore ];

function getStateFromStores( props ) {
	return {
		domains: props.domains,
		isRequestingSiteDomains: props.isRequestingSiteDomains,
		cart: CartStore.get(),
		context: props.context,
		products: props.products,
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite,
		sitePlans: props.sitePlans,
		user: user.get(),
		googleAppsUsers: props.googleAppsUsers,
		googleAppsUsersLoaded: props.googleAppsUsersLoaded,
	};
}

class EmailData extends React.Component {
	static displayName = 'EmailData';

	static propTypes = {
		analyticsPath: PropTypes.string,
		analyticsTitle: PropTypes.string,
		component: PropTypes.func.isRequired,
		context: PropTypes.object.isRequired,
		productsList: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string,
		selectedSite: PropTypes.object.isRequired,
		sitePlans: PropTypes.object.isRequired,
		googleAppsUsers: PropTypes.array.isRequired,
		googleAppsUsersLoaded: PropTypes.bool.isRequired,
	};

	componentWillMount() {
		const { selectedSite } = this.props;

		this.loadDomainsAndSitePlans( selectedSite );
		this.props.fetchGoogleAppsUsers( selectedSite.ID );
	}

	componentWillUpdate( nextProps ) {
		const { selectedSite: nextSite } = nextProps;
		const { selectedSite: prevSite } = this.props;

		if ( nextSite !== prevSite ) {
			this.loadDomainsAndSitePlans( nextSite );
		}
	}

	loadDomainsAndSitePlans = site => {
		this.props.fetchSitePlans( this.props.sitePlans, site );
	};

	render() {
		const { selectedSite } = this.props;

		return (
			<div>
				<PageViewTracker path={ this.props.analyticsPath } title={ this.props.analyticsTitle } />
				{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }
				<QueryProducts />
				<QuerySites />
				<StoreConnection
					component={ this.props.component }
					context={ this.props.context }
					domains={ this.props.domains }
					getStateFromStores={ getStateFromStores }
					googleAppsUsers={ this.props.googleAppsUsers }
					googleAppsUsersLoaded={ this.props.googleAppsUsersLoaded }
					isRequestingSiteDomains={ this.props.requestingSiteDomains }
					products={ this.props.products }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ selectedSite }
					sitePlans={ this.props.sitePlans }
					stores={ stores }
				/>
			</div>
		);
	}
}

export default connect(
	( state, { selectedDomainName } ) => {
		const selectedSite = getSelectedSite( state );
		const googleAppsUsers = selectedDomainName
			? getByDomain( state, selectedDomainName )
			: getBySite( state, selectedSite.ID );
		const siteId = get( selectedSite, 'ID', null );

		return {
			domains: getDomainsBySiteId( state, siteId ),
			googleAppsUsers,
			googleAppsUsersLoaded: isLoaded( state ),
			products: getProductsList( state ),
			requestingSiteDomains: isRequestingSiteDomains( state, siteId ),
			sitePlans: getPlansBySite( state, selectedSite ),
			selectedSite,
		};
	},
	( dispatch, { selectedDomainName } ) => {
		const googleAppsUsersFetcher = selectedDomainName
			? () => fetchByDomain( selectedDomainName )
			: siteId => fetchBySiteId( siteId );

		return {
			fetchGoogleAppsUsers: siteId => dispatch( googleAppsUsersFetcher( siteId ) ),
			fetchSitePlans: ( sitePlans, site ) => {
				if ( shouldFetchSitePlans( sitePlans, site ) ) {
					dispatch( fetchSitePlans( site.ID ) );
				}
			},
		};
	}
)( EmailData );
