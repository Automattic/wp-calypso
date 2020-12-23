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
import config from 'calypso/config';
import { Button } from '@automattic/components';
import canCurrentUserForSites from 'calypso/state/selectors/can-current-user-for-sites';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import DocumentHead from 'calypso/components/data/document-head';
import DomainItem from './domain-item';
import ListHeader from './list-header';
import FormattedHeader from 'calypso/components/formatted-header';
import {
	getAllDomains,
	getFlatDomainsList,
	getAllRequestingSiteDomains,
} from 'calypso/state/sites/domains/selectors';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import { getDomainManagementPath } from './utils';
import getSites from 'calypso/state/selectors/get-sites';
import isRequestingAllDomains from 'calypso/state/selectors/is-requesting-all-domains';
import ListItemPlaceholder from './item-placeholder';
import Main from 'calypso/components/main';
import { type as domainTypes } from 'calypso/lib/domains/constants';
import QueryAllDomains from 'calypso/components/data/query-all-domains';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { getUserPurchases } from 'calypso/state/purchases/selectors';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import { hasAllSitesList } from 'calypso/state/sites/selectors';
import EmptyContent from 'calypso/components/empty-content';

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
		page( '/start/add-domain' );
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
					isManagingAllSites
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

		const domainListItems = this.filteredDomains().map( ( domain, index ) => {
			return this.renderDomainItem( domain, index );
		} );

		return [ <ListHeader key="list-header" />, ...domainListItems ];
	}

	filteredDomains() {
		const { domainsList, canManageSitesMap } = this.props;
		if ( ! domainsList ) {
			return [];
		}

		// filter on sites we can manage, that aren't `wpcom` type
		return domainsList.filter(
			( domain ) => domain.type !== domainTypes.WPCOM && canManageSitesMap[ domain.blogId ]
		);
	}

	renderContent() {
		const { domainsList, translate, user } = this.props;

		if ( domainsList.length > 0 && this.filteredDomains().length === 0 ) {
			return (
				<EmptyContent
					title={ translate( 'Your next big idea starts here' ) }
					line={ translate( 'Find the domain that defines you' ) }
					action={ translate( 'Start your search' ) }
					actionURL="/domains"
					illustration="/calypso/images/illustrations/domains-blank-slate.svg"
				/>
			);
		}

		return (
			<>
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
			</>
		);
	}

	render() {
		return <Main wideLayout>{ this.renderContent() }</Main>;
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
