/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StoreConnection from 'components/data/store-connection';
import CartStore from 'lib/cart/store';
import QueryProducts from 'components/data/query-products-list';
import QuerySiteDomains from 'components/data/query-site-domains';
import QuerySitePlans from 'components/data/query-site-plans';
import { getCurrentUser } from 'state/current-user/selectors';
import {
	fetchByDomain,
	fetchBySiteId
} from 'state/google-apps-users/actions';
import {
	getByDomain,
	getBySite,
	isLoaded
} from 'state/google-apps-users/selectors';
import { getDomainsBySite, isRequestingSiteDomains } from 'state/sites/domains/selectors';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getProductsList } from 'state/products-list/selectors';
import { getSelectedSite } from 'state/ui/selectors';

const stores = [
	CartStore
];

function getStateFromStores( props ) {
	return {
		domains: props.domains,
		cart: CartStore.get(),
		context: props.context,
		products: props.products,
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite,
		sitePlans: props.sitePlans,
		user: props.user,
		googleAppsUsers: props.googleAppsUsers,
		googleAppsUsersLoaded: props.googleAppsUsersLoaded
	};
}

export class EmailData extends Component {
	static propTypes = {
		component: PropTypes.func.isRequired,
		context: PropTypes.object.isRequired,
		products: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string,
		selectedSite: PropTypes.object.isRequired,
		sitePlans: PropTypes.object.isRequired,
		googleAppsUsers: PropTypes.array.isRequired,
		googleAppsUsersLoaded: PropTypes.bool.isRequired,
	};

	componentDidMount() {
		this.props.fetchGoogleAppsUsers();
	}

	render() {
		const {
			selectedSite: { ID: siteId },
		} = this.props;

		return (
			<div>
				<QueryProducts />
				<QuerySiteDomains { ...{ siteId } } />
				<QuerySitePlans { ...{ siteId } } />
				<StoreConnection
					component={ this.props.component }
					domains={ this.props.domains }
					googleAppsUsers={ this.props.googleAppsUsers }
					googleAppsUsersLoaded={ this.props.googleAppsUsersLoaded }
					stores={ stores }
					getStateFromStores={ getStateFromStores }
					products={ this.props.products }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ this.props.selectedSite }
					sitePlans={ this.props.sitePlans }
					user={ this.props.currentUser }
					context={ this.props.context }
				/>
			</div>
		);
	}
}

const mapStateToProps = ( state, { selectedDomainName } ) => {
	const selectedSite = getSelectedSite( state );
	const googleAppsUsers = selectedDomainName
		? getByDomain( state, selectedDomainName )
		: getBySite( state, selectedSite.ID );

	return {
		googleAppsUsers,
		selectedSite,
		currentUser: getCurrentUser( state ),
		domains: {
			isFetching: isRequestingSiteDomains( state, selectedSite.ID ),
			list: getDomainsBySite( state, selectedSite ),
		},
		googleAppsUsersLoaded: isLoaded( state ),
		products: getProductsList( state ),
		sitePlans: getPlansBySite( state, selectedSite ),
	};
};

const mapDispatchToProps = ( dispatch, { selectedDomainName } ) => {
	const googleAppsUsersFetcher = selectedDomainName
		? () => dispatch( fetchByDomain( selectedDomainName ) )
		: selectedSite => dispatch( fetchBySiteId( selectedSite.ID ) );

	return { googleAppsUsersFetcher };
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const { selectedSite } = stateProps;
	const { googleAppsUsersFetcher } = dispatchProps;

	return {
		...ownProps,
		...stateProps,
		...dispatchProps,
		fetchGoogleAppsUsers: () => googleAppsUsersFetcher( selectedSite ),
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( EmailData );
