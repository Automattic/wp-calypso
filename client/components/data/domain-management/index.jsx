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
import CartStore from 'lib/cart/store';
import DnsStore from 'lib/domains/dns/store';
import { fetchUsers } from 'lib/users/actions';
import { getCurrentUser } from 'state/current-user/selectors';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { getDecoratedSiteDomains, isRequestingSiteDomains } from 'state/sites/domains/selectors';
import { getProductsList } from 'state/products-list/selectors';
import NameserversStore from 'lib/domains/nameservers/store';
import { fetchDns, fetchNameservers, fetchWapiDomainInfo, fetchWhois } from 'lib/upgrades/actions';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import QueryProductsList from 'components/data/query-products-list';
import QuerySitePlans from 'components/data/query-site-plans';
import QuerySiteDomains from 'components/data/query-site-domains';
import SiteRedirectStore from 'lib/domains/site-redirect/store';
import StoreConnection from 'components/data/store-connection';
import UsersStore from 'lib/users/store';
import WapiDomainInfoStore from 'lib/domains/wapi-domain-info/store';
import WhoisStore from 'lib/domains/whois/store';

function getStateFromStores( props ) {
	return {
		cart: CartStore.get(),
		context: props.context,
		domains: props.selectedSite ? props.domains : null,
		dns: DnsStore.getByDomainName( props.selectedDomainName ),
		isRequestingSiteDomains: props.isRequestingSiteDomains,
		location: SiteRedirectStore.getBySite( props.selectedSite.domain ),
		nameservers: NameserversStore.getByDomainName( props.selectedDomainName ),
		products: props.products,
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite,
		sitePlans: props.sitePlans,
		user: props.currentUser,
		users: UsersStore.getUsers( { siteId: props.selectedSite.ID } ),
		wapiDomainInfo: WapiDomainInfoStore.getByDomainName( props.selectedDomainName ),
		whois: WhoisStore.getByDomainName( props.selectedDomainName ),
	};
}

class DomainManagementData extends React.Component {
	static propTypes = {
		analyticsPath: PropTypes.string,
		analyticsTitle: PropTypes.string,
		context: PropTypes.object.isRequired,
		domains: PropTypes.array,
		isRequestingSiteDomains: PropTypes.bool,
		needsCart: PropTypes.bool,
		needsContactDetails: PropTypes.bool,
		needsDns: PropTypes.bool,
		needsDomains: PropTypes.bool,
		needsDomainInfo: PropTypes.bool,
		needsNameservers: PropTypes.bool,
		needsPlans: PropTypes.bool,
		needsProductsList: PropTypes.bool,
		needsSiteRedirect: PropTypes.bool,
		needsUsers: PropTypes.bool,
		needsWhois: PropTypes.bool,
		productsList: PropTypes.object,
		selectedDomainName: PropTypes.string,
		selectedSite: PropTypes.object,
		sitePlans: PropTypes.object,
	};

	constructor( props ) {
		super( props );

		this.loadData( {} );
	}

	componentDidUpdate( prevProps ) {
		this.loadData( prevProps );
	}

	loadData = prevProps => {
		const { needsUsers, selectedDomainName, selectedSite } = this.props;

		if ( this.props.needsDns ) {
			fetchDns( selectedDomainName );
		}

		if ( this.props.needsDomainInfo ) {
			fetchWapiDomainInfo( selectedDomainName );
		}

		if ( this.props.needsNameservers ) {
			fetchNameservers( selectedDomainName );
		}

		if ( this.props.needsWhois ) {
			fetchWhois( this.props.selectedDomainName );
		}

		if (
			needsUsers &&
			( prevProps.needsUsers !== needsUsers || prevProps.selectedSite !== selectedSite )
		) {
			fetchUsers( { siteId: selectedSite.ID, number: 1000 } );
		}
	};

	render() {
		const {
			needsCart,
			needsContactDetails,
			needsDns,
			needsDomains,
			needsDomainInfo,
			needsNameservers,
			needsPlans,
			needsProductsList,
			needsSiteRedirect,
			needsUsers,
			needsWhois,
			selectedSite,
		} = this.props;

		const stores = [];
		if ( needsCart ) {
			stores.push( CartStore );
		}
		if ( needsDns ) {
			stores.push( DnsStore );
		}
		if ( needsDomainInfo ) {
			stores.push( WapiDomainInfoStore );
		}
		if ( needsNameservers ) {
			stores.push( NameserversStore );
		}
		if ( needsSiteRedirect ) {
			stores.push( SiteRedirectStore );
		}
		if ( needsUsers ) {
			stores.push( UsersStore );
		}
		if ( needsWhois ) {
			stores.push( WhoisStore );
		}

		return (
			<div>
				<PageViewTracker path={ this.props.analyticsPath } title={ this.props.analyticsTitle } />
				{ selectedSite && needsContactDetails && <QueryContactDetailsCache /> }
				{ selectedSite && needsDomains && <QuerySiteDomains siteId={ selectedSite.ID } /> }
				{ selectedSite && needsPlans && <QuerySitePlans siteId={ selectedSite.ID } /> }
				{ needsProductsList && <QueryProductsList /> }

				<StoreConnection
					component={ this.props.component }
					context={ this.props.context }
					currentUser={ this.props.currentUser }
					domains={ this.props.domains }
					getStateFromStores={ getStateFromStores }
					isRequestingSiteDomains={ this.props.isRequestingSiteDomains }
					products={ this.props.productsList }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ selectedSite }
					sitePlans={ this.props.sitePlans }
					stores={ stores }
				/>
			</div>
		);
	}
}

export default connect( state => {
	const selectedSite = getSelectedSite( state );
	const siteId = get( selectedSite, 'ID', null );

	return {
		currentUser: getCurrentUser( state ),
		domains: getDecoratedSiteDomains( state, siteId ),
		isRequestingSiteDomains: isRequestingSiteDomains( state, siteId ),
		productsList: getProductsList( state ),
		sitePlans: getPlansBySite( state, selectedSite ),
		selectedSite,
	};
} )( DomainManagementData );
