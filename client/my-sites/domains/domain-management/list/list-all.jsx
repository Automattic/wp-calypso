/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { keyBy, keys, times } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import canCurrentUserForSites from 'state/selectors/can-current-user-for-sites';
import DocumentHead from 'components/data/document-head';
import DomainItem from './domain-item';
import FormattedHeader from 'components/formatted-header';
import { getAllDomains, getFlatDomainsList } from 'state/sites/domains/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { getCurrentRoute } from 'state/selectors/get-current-route';
import { getDomainManagementPath } from './utils';
import getVisibleSites from 'state/selectors/get-visible-sites';
import isRequestingAllDomains from 'state/selectors/is-requesting-all-domains';
import Main from 'components/main';
import QueryAllDomains from 'components/data/query-all-domains';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import ListItemPlaceholder from './item-placeholder';

class ListAll extends Component {
	handleDomainItemClick = ( domain ) => {
		const { sites, currentRoute } = this.props;
		const site = sites[ domain.blogId ];
		page( getDomainManagementPath( domain.domain, domain.type, site.slug, currentRoute ) );
	};

	isLoading() {
		const { domainsList, requestingDomains } = this.props;
		return requestingDomains && domainsList.length === 0;
	}

	renderDomainsList() {
		if ( this.isLoading() ) {
			return times( 3, ( n ) => <ListItemPlaceholder key={ `item-${ n }` } /> );
		}

		const { domainsList, canManageSitesMap } = this.props;

		return domainsList
			.filter( ( domain ) => canManageSitesMap[ domain.blogId ] ) // filter on sites we can manage
			.map( ( domain, index ) => (
				<DomainItem
					key={ `${ index }-${ domain.name }` }
					domain={ domain }
					onClick={ this.handleDomainItemClick }
				/>
			) );
	}

	render() {
		const { translate } = this.props;

		return (
			<Main wideLayout>
				<FormattedHeader brandFont headerText={ translate( 'All Domains' ) } align="left" />
				<div className="list-all__container">
					<QueryAllDomains />
					<Main wideLayout>
						<DocumentHead title={ translate( 'Domains', { context: 'A navigation label.' } ) } />
						<SidebarNavigation />
						<div className="list-all__items">{ this.renderDomainsList() }</div>
					</Main>
				</div>
			</Main>
		);
	}
}

export default connect( ( state ) => {
	const sites = keyBy( getVisibleSites( state ), 'ID' );
	return {
		canManageSitesMap: canCurrentUserForSites( state, keys( sites ), 'manage_options' ),
		currentRoute: getCurrentRoute( state ),
		domains: getAllDomains( state ),
		domainsList: getFlatDomainsList( state ),
		requestingDomains: isRequestingAllDomains( state ),
		sites,
		user: getCurrentUser( state ),
	};
} )( localize( ListAll ) );
