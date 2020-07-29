/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { keyBy, keys, times } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LazyRender from 'react-lazily-render';

/**
 * Internal dependencies
 */
import config from 'config';
import { Button } from '@automattic/components';
import canCurrentUserForSites from 'state/selectors/can-current-user-for-sites';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import { domainAddNew } from 'my-sites/domains/paths';
import DocumentHead from 'components/data/document-head';
import DomainItem from './domain-item';
import ListHeader from './list-header';
import FormattedHeader from 'components/formatted-header';
import {
	getAllDomains,
	getFlatDomainsList,
	getAllRequestingSiteDomains,
} from 'state/sites/domains/selectors';
import { getCurrentUser } from 'state/current-user/selectors';
import { getCurrentRoute } from 'state/selectors/get-current-route';
import { getDomainManagementPath } from './utils';
import getSites from 'state/selectors/get-sites';
import isRequestingAllDomains from 'state/selectors/is-requesting-all-domains';
import ListItemPlaceholder from './item-placeholder';
import Main from 'components/main';
import { type as domainTypes } from 'lib/domains/constants';
import QueryAllDomains from 'components/data/query-all-domains';
import QuerySiteDomains from 'components/data/query-site-domains';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import { getUserPurchases } from 'state/purchases/selectors';
import QueryUserPurchases from 'components/data/query-user-purchases';
import { hasAllSitesList } from 'state/sites/selectors';

/**
 * Style dependencies
 */
import './list-all.scss';

class ListAll extends Component {
	static propTypes = {
		canManageSitesMap: PropTypes.object.isRequired,
		currentRoute: PropTypes.string.isRequired,
		domainsList: PropTypes.array.isRequired,
		sites: PropTypes.object.isRequired,
		user: PropTypes.object.isRequired,
		addDomainClick: PropTypes.func.isRequired,
		requestingSiteDomains: PropTypes.object,
	};

	renderedQuerySiteDomains = {};

	clickAddDomain = () => {
		this.props.addDomainClick();
		page( domainAddNew( '' ) );
	};

	handleDomainItemClick = ( domain ) => {
		const { sites, currentRoute } = this.props;
		const site = sites[ domain.blogId ];
		page( getDomainManagementPath( domain.name, domain.type, site.slug, currentRoute ) );
	};

	headerButtons() {
		if ( ! config.isEnabled( 'upgrades/domain-search' ) ) {
			return null;
		}

		return (
			<Button primary compact className="list-all__add-a-domain" onClick={ this.clickAddDomain }>
				{ this.props.translate( 'Add a domain' ) }
			</Button>
		);
	}

	isLoading() {
		const { domainsList, requestingFlatDomains, hasAllSitesLoaded } = this.props;
		return ! hasAllSitesLoaded || ( requestingFlatDomains && domainsList.length === 0 );
	}

	findDomainDetails( domainsDetails = [], domain = {} ) {
		return domainsDetails[ domain?.blogId ]?.find(
			( element ) => element.type === domain.type && element.domain === domain.domain
		);
	}

	renderQuerySiteDomainsOnce( blogId ) {
		if ( this.renderedQuerySiteDomains[ blogId ] ) {
			return null;
		}
		this.renderedQuerySiteDomains[ blogId ] = true;
		return <QuerySiteDomains siteId={ blogId } />;
	}

	renderDomainItem( domain, index ) {
		const { currentRoute, domainsDetails, sites, requestingSiteDomains } = this.props;
		const domainDetails = this.findDomainDetails( domainsDetails, domain );

		return (
			<React.Fragment key={ `domain-item-${ index }-${ domain.name }` }>
				{ domain?.blogId && (
					<LazyRender>
						{ ( render ) => ( render ? this.renderQuerySiteDomainsOnce( domain.blogId ) : null ) }
					</LazyRender>
				) }
				<DomainItem
					currentRoute={ currentRoute }
					domain={ domain }
					domainDetails={ domainDetails }
					site={ sites[ domain?.blogId ] }
					isManagingAllSites={ true }
					isLoadingDomainDetails={
						! domainDetails && ( requestingSiteDomains[ domain?.blogId ] ?? false )
					}
					onClick={ this.handleDomainItemClick }
				/>
			</React.Fragment>
		);
	}

	renderDomainsList() {
		if ( this.isLoading() ) {
			return times( 3, ( n ) => <ListItemPlaceholder key={ `item-${ n }` } /> );
		}

		const { domainsList, canManageSitesMap } = this.props;

		const domainListItems = domainsList
			.filter(
				( domain ) => domain.type !== domainTypes.WPCOM && canManageSitesMap[ domain.blogId ]
			) // filter on sites we can manage, that aren't `wpcom` type
			.map( ( domain, index ) => {
				return this.renderDomainItem( domain, index );
			} );

		return [ <ListHeader key="list-header" />, ...domainListItems ];
	}

	render() {
		const { translate, user } = this.props;

		return (
			<Main wideLayout>
				<div className="list-all__heading">
					<FormattedHeader brandFont headerText={ translate( 'All Domains' ) } align="left" />
					<div className="list-all__heading-buttons">{ this.headerButtons() }</div>
				</div>
				<div className="list-all__container">
					<QueryAllDomains />
					<QueryUserPurchases userId={ user.ID } />
					<Main wideLayout>
						<SidebarNavigation />
						<DocumentHead title={ translate( 'Domains', { context: 'A navigation label.' } ) } />
						<div className="list-all__items">{ this.renderDomainsList() }</div>
					</Main>
				</div>
			</Main>
		);
	}
}

const addDomainClick = () =>
	composeAnalytics(
		recordGoogleEvent( 'Domain Management', 'Clicked "Add Domain" Button in ListAll' ),
		recordTracksEvent( 'calypso_domain_management_list_all_add_domain_click' )
	);

export default connect(
	( state ) => {
		const sites = keyBy( getSites( state ), 'ID' );
		const user = getCurrentUser( state );
		const purchases = keyBy( getUserPurchases( state, user?.ID ) || [], 'id' );

		return {
			canManageSitesMap: canCurrentUserForSites( state, keys( sites ), 'manage_options' ),
			currentRoute: getCurrentRoute( state ),
			domainsList: getFlatDomainsList( state ),
			domainsDetails: getAllDomains( state ),
			purchases,
			requestingFlatDomains: isRequestingAllDomains( state ),
			requestingSiteDomains: getAllRequestingSiteDomains( state ),
			sites,
			hasAllSitesLoaded: hasAllSitesList( state ),
			user,
		};
	},
	{
		addDomainClick,
	}
)( localize( ListAll ) );
