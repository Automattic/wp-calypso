/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get, times, isEmpty, noop } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import { getCurrentUser } from 'state/current-user/selectors';
import getVisibleSites from 'state/selectors/get-visible-sites';
import SectionHeader from 'components/section-header';
import QuerySiteDomains from 'components/data/query-site-domains';
import { getAllDomains } from 'state/sites/domains/selectors';
import { type } from 'lib/domains/constants';
import ListItemPlaceholder from './item-placeholder';
import ListItem from './item';
import {
	domainManagementEdit,
	domainManagementList,
	domainManagementTransferIn,
} from 'my-sites/domains/paths';
import FormattedHeader from 'components/formatted-header';

class ListAll extends Component {
	renderDomain( site, domain, index ) {
		return (
			<ListItem
				key={ index + domain.name }
				domain={ domain }
				selectionIndex={ index }
				onClick={ this.goToEditDomainRoot( site ) }
				onSelect={ noop }
			/>
		);
	}

	renderSiteDomains( site ) {
		if ( this.isLoading( site ) ) {
			return times( 3, n => <ListItemPlaceholder key={ `item-${ n }` } /> );
		}
		return this.props.domains[ site.ID ].map( ( domain, domainIndex ) =>
			this.renderDomain( site, domain, domainIndex )
		);
	}

	isLoading( site ) {
		return isEmpty( get( this.props.domains, site.ID ) );
	}

	renderSingleSite( site, siteIndex ) {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div key={ siteIndex } className="list-all__site">
				<QuerySiteDomains siteId={ site.ID } />
				<SectionHeader label={ site.title } href={ domainManagementList( site.slug ) } />
				<div className="domain-management-list__items">{ this.renderSiteDomains( site ) }</div>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	render() {
		const { translate } = this.props;
		return (
			<React.Fragment>
				<FormattedHeader headerText={ translate( 'All Domains' ) } align="left" />
				<div className="list-all__container">
					{ this.props.sites.map( ( site, index ) => this.renderSingleSite( site, index ) ) }
				</div>
			</React.Fragment>
		);
	}

	goToEditDomainRoot = site => domain => {
		if ( domain.type !== type.TRANSFER ) {
			page( domainManagementEdit( site.slug, domain.name ) );
		} else {
			page( domainManagementTransferIn( site.slug, domain.name ) );
		}
	};
}

export default connect( state => {
	return {
		user: getCurrentUser( state ),
		sites: getVisibleSites( state ),
		domains: getAllDomains( state ),
	};
} )( localize( ListAll ) );
