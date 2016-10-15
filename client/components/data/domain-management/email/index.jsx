/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { partial } from 'lodash';

/**
 * Internal dependencies
 */
import StoreConnection from 'components/data/store-connection';
import DomainsStore from 'lib/domains/store';
import CartStore from 'lib/cart/store';
import QueryProducts from 'components/data/query-products-list';
import { fetchDomains } from 'lib/upgrades/actions';
import userFactory from 'lib/user';
import {
	fetchByDomain,
	fetchBySiteId
} from 'state/google-apps-users/actions';
import {
	getByDomain,
	getBySite,
	isLoaded
} from 'state/google-apps-users/selectors';
import { shouldFetchSitePlans } from 'lib/plans';
import { fetchSitePlans } from 'state/sites/plans/actions';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getProductsList } from 'state/products-list/selectors';
import { getSelectedSite } from 'state/ui/selectors';

const user = userFactory();

const stores = [
	DomainsStore,
	CartStore
];

function getStateFromStores( props ) {
	return {
		domains: DomainsStore.getBySite( props.selectedSite.ID ) || {},
		cart: CartStore.get(),
		context: props.context,
		products: props.products,
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite,
		sitePlans: props.sitePlans,
		user: user.get(),
		googleAppsUsers: props.googleAppsUsers,
		googleAppsUsersLoaded: props.googleAppsUsersLoaded
	};
}

export class EmailData extends Component {
	static propTypes = {
		context: PropTypes.object.isRequired,
		fetchSitePlans: PropTypes.func.isRequired,
		products: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string,
		selectedSite: PropTypes.object.isRequired,
		sitePlans: PropTypes.object.isRequired,
		googleAppsUsers: PropTypes.array.isRequired,
		googleAppsUsersLoaded: PropTypes.bool.isRequired,
	};

	constructor( props ) {
		super( props );

		props.loadDomainsAndSitePlans();
	}

	componentDidMount() {
		this.props.fetchGoogleAppsUsers();
	}

	componentWillUpdate( nextProps ) {
		const { selectedSite: nextSite } = nextProps;
		const { selectedSite: prevSite } = this.props;

		if ( nextSite !== prevSite ) {
			this.props.loadDomainsAndSitePlans();
		}
	}

	render() {
		return (
			<div>
				<QueryProducts />
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
					context={ this.props.context }
				/>
			</div>
		);
	}
}

const loadDomainsAndSitePlans = ( fetchSitePlans, selectedSite, sitePlans ) => {
	if ( ! selectedSite ) {
		return;
	}

	if ( ! shouldFetchSitePlans( sitePlans, selectedSite ) ) {
		return;
	}

	fetchDomains( selectedSite.ID );
	fetchSitePlans( selectedSite.ID );
};

const mapStateToProps = ( state, { selectedDomainName } ) => {
	const selectedSite = getSelectedSite( state );
	const googleAppsUsers = selectedDomainName
		? getByDomain( state, selectedDomainName )
		: getBySite( state, selectedSite.ID );

	return {
		googleAppsUsers,
		googleAppsUsersLoaded: isLoaded( state ),
		products: getProductsList( state ),
		selectedSite,
		sitePlans: getPlansBySite( state, selectedSite ),
	};
};

const mapDispatchToProps = ( dispatch, { selectedDomainName } ) => {
	const googleAppsUsersFetcher = selectedDomainName
		? () => dispatch( fetchByDomain( selectedDomainName ) )
		: selectedSite => dispatch( fetchBySiteId( selectedSite.ID ) );

	return {
		fetchSitePlans: siteId => dispatch( fetchSitePlans( siteId ) ),
		googleAppsUsersFetcher,
	};
};

const mergeProps = ( stateProps, dispatchProps, ownProps ) => {
	const {
		selectedSite,
		sitePlans,
	} = stateProps;

	const {
		fetchSitePlans,
		googleAppsUsersFetcher,
	} = dispatchProps;

	return {
		...ownProps,
		...stateProps,
		...dispatchProps,
		fetchGoogleAppsUsers: () => googleAppsUsersFetcher( selectedSite ),
		loadDomainsAndSitePlans: partial(
			loadDomainsAndSitePlans,
			fetchSitePlans,
			selectedSite,
			sitePlans,
		)
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( EmailData );
