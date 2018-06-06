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
import QueryProductsList from 'components/data/query-products-list';
import QuerySitePlans from 'components/data/query-site-plans';
import QuerySiteDomains from 'components/data/query-site-domains';
import QueryContactDetailsCache from 'components/data/query-contact-details-cache';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import { getDecoratedSiteDomains, isRequestingSiteDomains } from 'state/sites/domains/selectors';
import { getProductsList } from 'state/products-list/selectors';
import NameserversStore from 'lib/domains/nameservers/store';
import {
	fetchDns,
	fetchEmailForwarding,
	fetchNameservers,
	fetchWapiDomainInfo,
	fetchWhois,
} from 'lib/upgrades/actions';
import UsersStore from 'lib/users/store';
import WapiDomainInfoStore from 'lib/domains/wapi-domain-info/store';
import { fetchUsers } from 'lib/users/actions';
import SiteRedirectStore from 'lib/domains/site-redirect/store';
import DnsStore from 'lib/domains/dns/store';
import EmailForwardingStore from 'lib/domains/email-forwarding/store';
import WhoisStore from 'lib/domains/whois/store';

function getStateFromStores( props ) {
	return {
		cart: CartStore.get(),
		context: props.context,
		domains: props.selectedSite ? props.domains : null,
		dns: DnsStore.getByDomainName( props.selectedDomainName ),
		emailForwarding: EmailForwardingStore.getByDomainName( props.selectedDomainName ),
		isRequestingSiteDomains: props.isRequestingSiteDomains,
		location: SiteRedirectStore.getBySite( props.selectedSite.domain ),
		nameservers: NameserversStore.getByDomainName( props.selectedDomainName ),
		products: props.products,
		selectedDomainName: props.selectedDomainName,
		selectedSite: props.selectedSite,
		sitePlans: props.sitePlans,
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
		needsEmailForwarding: PropTypes.bool,
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
		const { selectedDomainName, selectedSite } = this.props;

		if ( this.props.needsDns ) {
			fetchDns( selectedDomainName );
		}

		if ( this.props.needsDomainInfo ) {
			fetchWapiDomainInfo( selectedDomainName );
		}

		if ( this.props.needsEmailForwarding ) {
			fetchEmailForwarding( selectedDomainName );
		}

		if ( this.props.needsNameservers ) {
			fetchNameservers( selectedDomainName );
		}

		if ( this.props.needsUsers ) {
			if ( prevProps.selectedSite !== selectedSite ) {
				fetchUsers( { siteId: selectedSite.ID, number: 1000 } );
			}
		}

		if ( this.props.needsWhois ) {
			fetchWhois( this.props.selectedDomainName );
		}
	};

	render() {
		const {
			needsCart,
			needsContactDetails,
			needsDns,
			needsDomains,
			needsDomainInfo,
			needsEmailForwarding,
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
		if ( needsEmailForwarding ) {
			stores.push( EmailForwardingStore );
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
		domains: getDecoratedSiteDomains( state, siteId ),
		isRequestingSiteDomains: isRequestingSiteDomains( state, siteId ),
		productList: getProductsList( state ),
		sitePlans: getPlansBySite( state, selectedSite ),
		selectedSite,
	};
} )( DomainManagementData );
