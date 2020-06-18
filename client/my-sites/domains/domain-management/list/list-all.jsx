/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'state/current-user/selectors';
import getVisibleSites from 'state/selectors/get-visible-sites';
import Main from 'components/main';
import QueryAllDomains from 'components/data/query-all-domains';
import {
	getAllDomains,
	getFlatDomainsList,
	getAllRequestingSiteDomains,
} from 'state/sites/domains/selectors';
import FormattedHeader from 'components/formatted-header';
import DocumentHead from 'components/data/document-head';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import DomainItem from './domain-item';

class ListAll extends Component {
	renderDomainsList() {
		const { domainsList } = this.props;

		return domainsList.map( ( domain, index ) => (
			<DomainItem key={ `${ index }-${ domain.name }` } domain={ domain } />
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
	return {
		user: getCurrentUser( state ),
		sites: getVisibleSites( state ),
		domains: getAllDomains( state ),
		domainsList: getFlatDomainsList( state ),
		requestingDomains: getAllRequestingSiteDomains( state ),
	};
} )( localize( ListAll ) );
