import { localize } from 'i18n-calypso';
import moment from 'moment';
import page from 'page';
import PropTypes from 'prop-types';
import { stringify, parse } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryAllDomainsWithDetails from 'calypso/components/data/query-all-domains-with-details';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import { resolveDomainStatus } from 'calypso/lib/domains';
import { type as domainTypes } from 'calypso/lib/domains/constants';
import Breadcrumbs from 'calypso/my-sites/domains/domain-management/components/breadcrumbs';
import OptionsDomainButton from 'calypso/my-sites/domains/domain-management/list/options-domain-button';
import { domainManagementRoot } from 'calypso/my-sites/domains/paths';
import {
	getUserPurchases,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import canCurrentUserForSites from 'calypso/state/selectors/can-current-user-for-sites';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import getSites from 'calypso/state/selectors/get-sites';
import isRequestingAllDomains from 'calypso/state/selectors/is-requesting-all-domains';
import {
	getAllDomains,
	getAllRequestingSiteDomains,
	getFlatDomainsList,
	getFlatDomainsList2,
} from 'calypso/state/sites/domains/selectors';
import { hasAllSitesList } from 'calypso/state/sites/selectors';
import DomainOnlyUpsellCarousel from './domain-only-upsell-carousel';
import DomainsTable from './domains-table';
import DomainsTableFilterButton from './domains-table-filter-button';
import { filterDomainsByOwner, filterDomainOnlyDomains } from './helpers';
import ListItemPlaceholder from './item-placeholder';
import {
	countDomainsInOrangeStatus,
	getDomainManagementPath,
	getSimpleSortFunctionBy,
	getReverseSimpleSortFunctionBy,
} from './utils';

// This is a copy of the AllDomains component without the bulk contact editing code
class AllDomainsTest extends Component {
	static propTypes = {
		canManageSitesMap: PropTypes.object.isRequired,
		currentRoute: PropTypes.string.isRequired,
		domainsList: PropTypes.array.isRequired,
		sites: PropTypes.object.isRequired,
		requestingSiteDomains: PropTypes.object,
	};

	handleDomainItemClick = ( domain ) => {
		const { sites, currentRoute } = this.props;
		const site = sites[ domain.blogId ];

		page( getDomainManagementPath( domain.name, domain.type, site.slug, currentRoute ) );
	};

	isLoading() {
		const { domainsList, requestingFlatDomains, hasAllSitesLoaded } = this.props;
		return ! hasAllSitesLoaded || ( requestingFlatDomains && domainsList.length === 0 );
	}

	isRequestingSiteDomains() {
		const { requestingSiteDomains } = this.props;

		return (
			Object.keys( requestingSiteDomains ?? {} ).length === 0 ||
			Object.values( requestingSiteDomains ).some( ( value ) => value )
		);
	}

	isLoadingDomainDetails() {
		return this.isLoading() || this.isRequestingSiteDomains();
	}

	findDomainDetails( domainsDetails = [], domain = {} ) {
		return domainsDetails[ domain?.blogId ]?.find(
			( element ) => element.type === domain.type && element.domain === domain.domain
		);
	}

	mergeFilteredDomainsWithDomainsDetails() {
		const { domainsDetails } = this.props;
		// This could be done only once
		return this.filteredDomains().map( ( domain ) => ( {
			...( this.findDomainDetails( domainsDetails, domain ) || domain ),
		} ) );
	}

	renderDomainsList() {
		if ( this.isLoading() ) {
			return Array.from( { length: 3 } ).map( ( _, n ) => (
				<ListItemPlaceholder key={ `item-${ n }` } />
			) );
		}

		console.log( {
			domainsList: this.props.domainsList,
			domainsDetails: this.props.domainsDetails,
			mergedList: this.mergeFilteredDomainsWithDomainsDetails(),
		} );
		console.log( '------' );

		const {
			purchases,
			sites,
			currentRoute,
			context,
			requestingSiteDomains,
			hasLoadedUserPurchases,
			translate,
		} = this.props;

		const selectedFilter = context?.query?.filter;

		const domains =
			selectedFilter === 'domain-only'
				? filterDomainOnlyDomains( this.mergeFilteredDomainsWithDomainsDetails(), sites )
				: filterDomainsByOwner( this.mergeFilteredDomainsWithDomainsDetails(), selectedFilter );

		const domainsTableColumns = [
			{
				name: 'domain',
				label: translate( 'Domain' ),
				isSortable: true,
				initialSortOrder: 1,
				supportsOrderSwitching: true,
				sortFunctions: [ getSimpleSortFunctionBy( 'domain' ) ],
			},
			{
				name: 'site',
				label: translate( 'Site' ),
				isSortable: true,
				initialSortOrder: 1,
				supportsOrderSwitching: true,
				sortFunctions: [
					( first, second, sortOrder ) => {
						// sort all domain olny sites after/before the other sites
						const firstSite = sites[ first?.blogId ];
						const secondSite = sites[ second?.blogId ];

						if ( firstSite?.options?.is_domain_only && secondSite?.options?.is_domain_only ) {
							return 0;
						}

						if ( firstSite?.options?.is_domain_only ) {
							return 1 * sortOrder;
						}

						if ( secondSite?.options?.is_domain_only ) {
							return -1 * sortOrder;
						}

						return 0;
					},
					( first, second, sortOrder ) => {
						const firstSite = sites[ first?.blogId ];
						const secondSite = sites[ second?.blogId ];

						const firstTitle = firstSite?.title || firstSite?.slug;
						const secondTitle = secondSite?.title || secondSite?.slug;

						return firstTitle.localeCompare( secondTitle ) * sortOrder;
					},
					getSimpleSortFunctionBy( 'domain' ),
				],
			},
			{
				name: 'status',
				label: translate( 'Status' ),
				isSortable: true,
				initialSortOrder: -1,
				sortFunctions: [
					( first, second, sortOrder ) => {
						const { listStatusWeight: firstStatusWeight } = resolveDomainStatus( first, null, {
							getMappingErrors: true,
						} );
						const { listStatusWeight: secondStatusWeight } = resolveDomainStatus( second, null, {
							getMappingErrors: true,
						} );
						return ( ( firstStatusWeight ?? 0 ) - ( secondStatusWeight ?? 0 ) ) * sortOrder;
					},
					getReverseSimpleSortFunctionBy( 'domain' ),
				],
				bubble: countDomainsInOrangeStatus(
					domains.map( ( domain ) =>
						resolveDomainStatus( domain, null, {
							getMappingErrors: true,
							siteSlug: sites[ domain.blogId ].slug,
						} )
					)
				),
			},
			{
				name: 'registered-until',
				label: translate( 'Registered until' ),
				isSortable: true,
				initialSortOrder: 1,
				supportsOrderSwitching: true,
				sortFunctions: [ getSimpleSortFunctionBy( 'expiry' ), getSimpleSortFunctionBy( 'domain' ) ],
			},
			{ name: 'auto-renew', label: translate( 'Auto-renew' ) },
			{ name: 'action', label: null },
		];

		return (
			<>
				<div className="all-domains__filter">{ this.renderDomainTableFilterButton() }</div>
				<DomainsTable
					currentRoute={ currentRoute }
					domains={ domains }
					handleDomainItemToggle={ this.handleDomainItemToggle }
					domainsTableColumns={ domainsTableColumns }
					isManagingAllSites={ true }
					isContactEmailEditContext={ false }
					goToEditDomainRoot={ this.handleDomainItemClick }
					isLoading={ this.isLoading() }
					purchases={ purchases }
					sites={ sites }
					requestingSiteDomains={ requestingSiteDomains }
					hasLoadedPurchases={ hasLoadedUserPurchases }
					isSavingContactInfo={ false }
				/>
			</>
		);
	}

	renderDomainOnlyUpsellCarousel() {
		const { sites } = this.props;
		const domains = filterDomainOnlyDomains(
			this.mergeFilteredDomainsWithDomainsDetails(),
			sites
		).sort( ( a, b ) => {
			if ( moment( a.registrationDate ).isBefore( b.registrationDate ) ) {
				return 1;
			} else if ( moment( a.registrationDate ).isAfter( b.registrationDate ) ) {
				return -1;
			}
			return 0;
		} );
		if ( domains.length === 0 ) {
			return null;
		}
		return <DomainOnlyUpsellCarousel domain={ domains[ 0 ] } />;
	}

	filteredDomains() {
		const { domainsList, canManageSitesMap } = this.props;
		if ( ! domainsList ) {
			return [];
		}

		// filter on sites we can manage that aren't `wpcom` type
		return domainsList.filter(
			( domain ) => domain.type !== domainTypes.WPCOM && canManageSitesMap[ domain.blogId ]
		);
	}

	renderDomainTableFilterButton() {
		const { context, translate, sites } = this.props;

		const selectedFilter = context?.query?.filter;
		const nonWpcomDomains = this.mergeFilteredDomainsWithDomainsDetails();

		const filterOptions = [
			{
				label: translate( 'All domains' ),
				value: '',
				path: domainManagementRoot(),
				count: nonWpcomDomains?.length,
			},
			{
				label: translate( 'Owned by me' ),
				value: 'owned-by-me',
				path: domainManagementRoot() + '?' + stringify( { filter: 'owned-by-me' } ),
				count: filterDomainsByOwner( nonWpcomDomains, 'owned-by-me' )?.length,
			},
			{
				label: translate( 'Owned by others' ),
				value: 'owned-by-others',
				path: domainManagementRoot() + '?' + stringify( { filter: 'owned-by-others' } ),
				count: filterDomainsByOwner( nonWpcomDomains, 'owned-by-others' )?.length,
			},
			{
				label: translate( 'Parked domains' ),
				value: 'domain-only',
				path: domainManagementRoot() + '?' + stringify( { filter: 'domain-only' } ),
				count: filterDomainOnlyDomains( nonWpcomDomains, sites )?.length,
			},
		];

		return (
			<DomainsTableFilterButton
				key="breadcrumb_button_2"
				selectedFilter={ selectedFilter || '' }
				filterOptions={ filterOptions }
				isLoading={ this.isLoadingDomainDetails() }
				disabled={ this.isLoadingDomainDetails() }
			/>
		);
	}

	renderBreadcrumbs() {
		const { translate } = this.props;

		const item = {
			label: translate( 'All Domains' ),
			helpBubble: translate(
				'Manage all your domains. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
				{
					components: {
						learnMoreLink: <InlineSupportLink supportContext="domains" showIcon={ false } />,
					},
				}
			),
		};

		const buttons = [
			this.renderDomainTableFilterButton(),
			<OptionsDomainButton key="breadcrumb_button_1" specificSiteActions />,
			<OptionsDomainButton key="breadcrumb_button_3" ellipsisButton borderless />,
		];

		const mobileButtons = [
			<OptionsDomainButton key="breadcrumb_button_1" specificSiteActions />,
			<OptionsDomainButton key="breadcrumb_button_3" ellipsisButton borderless />,
		];

		return (
			<Breadcrumbs
				items={ [ item ] }
				mobileItem={ item }
				buttons={ buttons }
				mobileButtons={ mobileButtons }
			/>
		);
	}

	renderContent() {
		const { translate } = this.props;

		return (
			<>
				<div>
					<QueryAllDomains />
					<QueryUserPurchases />
					<QueryAllDomainsWithDetails />
					<Main wideLayout>
						<DocumentHead title={ translate( 'Domains', { context: 'A navigation label.' } ) } />
						<div>{ this.renderDomainsList() }</div>
						<div>{ this.renderDomainOnlyUpsellCarousel() }</div>
					</Main>
				</div>
			</>
		);
	}

	render() {
		return (
			<Main wideLayout>
				<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
				{ this.renderBreadcrumbs() }
				{ this.renderContent() }
			</Main>
		);
	}
}

const getSitesById = ( state ) => {
	return ( getSites( state ) ?? [] ).reduce( ( result, site ) => {
		result[ site.ID ] = site;
		return result;
	}, {} );
};

export default connect( ( state, { context } ) => {
	const sites = getSitesById( state );

	return {
		canManageSitesMap: canCurrentUserForSites( state, Object.keys( sites ), 'manage_options' ),
		currentRoute: getCurrentRoute( state ),
		domainsList: getFlatDomainsList( state ),
		domainsDetails: getAllDomains( state ),
		hasAllSitesLoaded: hasAllSitesList( state ),
		purchases: getUserPurchases( state ) || [],
		hasLoadedUserPurchases: hasLoadedUserPurchasesFromServer( state ),
		requestingFlatDomains: isRequestingAllDomains( state ),
		requestingSiteDomains: getAllRequestingSiteDomains( state ),
		sites,
	};
}, null )( localize( AllDomainsTest ) );
