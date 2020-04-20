/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DomainManagement from 'my-sites/domains/domain-management';
import { getCurrentUser } from 'state/current-user/selectors';
import getVisibleSites from 'state/selectors/get-visible-sites';
import Main from 'components/main';
import QuerySiteDomains from 'components/data/query-site-domains';
import { getAllDomains, getAllRequestingSiteDomains } from 'state/sites/domains/selectors';
import FormattedHeader from 'components/formatted-header';

class ListAll extends Component {
	renderSiteDomains( site ) {
		return (
			<DomainManagement.List
				selectedSite={ site }
				domains={ get( this.props.domains, site.ID, [] ) }
				isRequestingSiteDomains={ get( this.props.requestingDomains, site.ID, false ) }
				renderAllSites={ true }
			/>
		);
	}

	renderSingleSite( site, siteIndex ) {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div key={ siteIndex } className="list-all__site">
				<QuerySiteDomains siteId={ site.ID } />
				<div className="domain-management-list__items">{ this.renderSiteDomains( site ) }</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	render() {
		const { translate } = this.props;
		return (
			<Main wideLayout>
				<FormattedHeader headerText={ translate( 'All Domains' ) } align="left" />
				<div className="list-all__container">
					{ this.props.sites.map( ( site, index ) => this.renderSingleSite( site, index ) ) }
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
		requestingDomains: getAllRequestingSiteDomains( state ),
	};
} )( localize( ListAll ) );
