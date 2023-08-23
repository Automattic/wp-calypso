import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { stringify, parse } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import QueryAllDomains from 'calypso/components/data/query-all-domains';
import EmptyContent from 'calypso/components/empty-content';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import Pagination from 'calypso/components/pagination';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import {
	resolveDomainStatus,
	isDomainInGracePeriod,
	isDomainUpdateable,
} from 'calypso/lib/domains';
import { type as domainTypes } from 'calypso/lib/domains/constants';
import wpcom from 'calypso/lib/wp';
import DomainHeader from 'calypso/my-sites/domains/domain-management/components/domain-header';
import DomainsTableInputFilter from 'calypso/my-sites/domains/domain-management/list/domains-table-input-filter';
import OptionsDomainButton from 'calypso/my-sites/domains/domain-management/list/options-domain-button';
import { domainManagementRoot } from 'calypso/my-sites/domains/paths';
import { setAllDomainsNavigationPage } from 'calypso/state/all-domains/actions';
import { getCurrentNavigationPage } from 'calypso/state/all-domains/selectors';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { infoNotice } from 'calypso/state/notices/actions';
import {
	getUserPurchases,
	hasLoadedUserPurchasesFromServer,
} from 'calypso/state/purchases/selectors';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import getSites from 'calypso/state/selectors/get-sites';
import isRequestingAllDomains from 'calypso/state/selectors/is-requesting-all-domains';
import {
	getAllDomains,
	getAllRequestingSiteDomains,
	getFlatDomainsList,
} from 'calypso/state/sites/domains/selectors';
import BulkEditContactInfo from './bulk-edit-contact-info';
import DomainsTable from './domains-table';
import DomainsTableFilterButton from './domains-table-filter-button';
import { EmptyDomainsListCardSkeleton } from './empty-domains-list-card-skeleton';
import { filterDomainsByOwner, filterDomainOnlyDomains } from './helpers';
import ListItemPlaceholder from './item-placeholder';
import {
	countDomainsInOrangeStatus,
	getDomainManagementPath,
	getSimpleSortFunctionBy,
	getReverseSimpleSortFunctionBy,
	ListAllActions,
} from './utils';

class AllDomains extends Component {
	static propTypes = {
		action: PropTypes.string,
		canManageSitesMap: PropTypes.object.isRequired,
		currentRoute: PropTypes.string.isRequired,
		domainsList: PropTypes.array.isRequired,
		filteredDomainsList: PropTypes.array.isRequired,
		sites: PropTypes.object.isRequired,
		requestingSiteDomains: PropTypes.object,
		isContactEmailEditContext: PropTypes.bool,
	};

	state = {
		isSavingContactInfo: false,
		selectedDomains: {},
		selectedDomainListHeader: true,
		transferLockOptOut: false,
		whoisData: {},
		contactInfoSaveResults: {},
		currentPage: 1,
		domainsPerPage: 5,
		searchTerm: '',
		sortedDomains: [],
	};

	componentDidMount() {
		const { currentPage } = this.props;
		const currentPageParsed = Number( currentPage );
		if ( ! isNaN( currentPageParsed ) ) {
			this.setCurrentPage( currentPageParsed );
		}
		this.setSortedDomains( this.getDomainsList() );
	}

	componentDidUpdate() {
		if ( this.props.isContactEmailEditContext && ! this.isLoadingDomainDetails() ) {
			this.setSelectedDomains();
		}
	}

	setCurrentPage = ( currentPage ) => {
		this.props.setCurrentPage( currentPage );
		this.setState( { currentPage } );
	};

	setSelectedDomains = () => {
		const newFilteredDomains = ( this.props.filteredDomainsList ?? [] ).filter( ( domain ) => {
			return ! Object.keys( this.state.selectedDomains ?? {} ).includes( domain.domain );
		} );

		if ( newFilteredDomains.length === 0 ) {
			return;
		}

		const newSelectedDomains = ( newFilteredDomains ?? [] ).reduce( ( list, domain ) => {
			return {
				...list,
				[ domain.domain ]: true,
			};
		}, {} );

		const newWhoisData = ( newFilteredDomains ?? [] ).reduce( ( list, domain ) => {
			return {
				...list,
				[ domain.domain ]: null,
			};
		}, {} );

		this.setState(
			( { selectedDomains, whoisData } ) => {
				return {
					selectedDomains: { ...selectedDomains, ...newSelectedDomains },
					whoisData: { ...newWhoisData, ...whoisData },
				};
			},
			() => {
				const domains = Object.keys( newSelectedDomains ?? {} );
				if ( domains.length === 0 ) {
					return;
				}

				domains.forEach( ( domain ) => {
					if ( Object.keys( this.state.whoisData[ domain ] ?? {} ).length === 0 ) {
						this.fetchWhoisData( domain );
					}
				} );
			}
		);
	};

	fetchWhoisData = ( domain ) => {
		wpcom.req
			.get( `/domains/${ domain }/whois` )
			.then( ( whoisData ) => this.setWhoisData( domain, whoisData[ 0 ] ?? null ) )
			.catch( () => this.setWhoisData( domain, null ) );
	};

	setWhoisData = ( domain, whoisData ) => {
		this.setState( { whoisData: { ...this.state.whoisData, [ domain ]: whoisData } } );
	};

	handleDomainItemClick = ( domain ) => {
		const { currentRoute } = this.props;

		if ( this.props.isContactEmailEditContext ) {
			return;
		}

		page( getDomainManagementPath( domain.name, domain.type, domain.blogId, currentRoute ) );
	};

	handleDomainItemToggle = ( domain, selected ) => {
		if ( selected && Object.keys( this.state.whoisData[ domain ] ?? {} ).length === 0 ) {
			this.fetchWhoisData( domain );
		}

		const selectedDomainListHeader = this.state.selectedDomainListHeader && selected;

		this.setState( ( { selectedDomains } ) => {
			return {
				selectedDomains: { ...selectedDomains, [ domain ]: selected },
				contactInfoSaveResults: {},
				selectedDomainListHeader: selectedDomainListHeader,
			};
		} );
	};

	isLoading() {
		const { domainsList, requestingFlatDomains } = this.props;
		return requestingFlatDomains && domainsList.length === 0;
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

	isLoadingWhoisData() {
		const { isContactEmailEditContext } = this.props;
		const { selectedDomains, whoisData } = this.state;

		if ( ! isContactEmailEditContext ) {
			return false;
		}

		if ( Object.keys( whoisData ?? {} ).length === 0 ) {
			return true;
		}

		const allWhoisLoaded = Object.entries( selectedDomains ).every( ( [ domain, selected ] ) => {
			if ( ! selected ) {
				return true;
			}
			return Object.keys( whoisData[ domain ] ?? {} ).length > 0;
		} );

		if ( ! allWhoisLoaded ) {
			return true;
		}

		return false;
	}

	findDomainDetails( domainsDetails = [], domain = {} ) {
		return domainsDetails[ domain?.blogId ]?.find(
			( element ) => element.type === domain.type && element.domain === domain.domain
		);
	}

	handleSelectAllDomains = ( event ) => {
		return this.handleDomainListHeaderToggle( event.target.checked );
	};

	mergeFilteredDomainsWithDomainsDetails() {
		const { domainsDetails } = this.props;
		const { selectedDomains } = this.state;
		return this.filteredDomains().map( ( domain ) => ( {
			...( this.findDomainDetails( domainsDetails, domain ) || domain ),
			selected: selectedDomains[ domain.name ],
		} ) );
	}

	handleDomainListHeaderToggle = ( selected ) => {
		const selectedDomains = Object.keys( this.state.selectedDomains ?? {} ).reduce(
			( list, domain ) => {
				return { ...list, [ domain ]: selected };
			},
			{}
		);

		this.setState( () => {
			return {
				selectedDomainListHeader: selected,
				contactInfoSaveResults: {},
				selectedDomains: selectedDomains,
			};
		} );
	};

	getSelectedFilter = () => {
		const { context } = this.props;
		return context?.query?.filter || 'all-domains';
	};

	getDomainsList = ( selectedFilter = this.getSelectedFilter() ) => {
		return selectedFilter === 'domain-only'
			? filterDomainOnlyDomains( this.mergeFilteredDomainsWithDomainsDetails() )
			: filterDomainsByOwner( this.mergeFilteredDomainsWithDomainsDetails(), selectedFilter );
	};

	filterDomainsByPage( domains ) {
		const { currentPage, domainsPerPage } = this.state;
		return domains.slice( ( currentPage - 1 ) * domainsPerPage, currentPage * domainsPerPage );
	}

	renderDomainsList() {
		if ( this.isLoading() ) {
			return (
				<div>
					{ Array.from( { length: 3 } ).map( ( _, n ) => (
						<ListItemPlaceholder key={ `item-${ n }` } />
					) ) }
				</div>
			);
		}

		const {
			purchases,
			sites,
			currentRoute,
			requestingSiteDomains,
			hasLoadedUserPurchases,
			isContactEmailEditContext,
			translate,
			domainsDetails,
		} = this.props;

		const { isSavingContactInfo } = this.state;

		const domains = this.getDomainsList();

		const currentPageDomains = this.filterDomainsByPage( domains );

		if ( domains.length === 0 && this.getSelectedFilter() === 'all-domains' ) {
			return (
				<EmptyDomainsListCardSkeleton
					title={ translate( 'All Domains' ) }
					line={ translate(
						'Here you will be able to manage all the domains you own on WordPress.com. Start by adding some:'
					) }
					action={ translate( 'Add a domain' ) }
					actionURL="/domains/add"
					secondaryAction={ translate( 'Transfer a domain' ) }
					secondaryActionURL="/start/domain-transfer/domains"
				/>
			);
		}

		const domainsTableColumns = this.getDomainsTableColumns( domains );

		if ( isContactEmailEditContext ) {
			const areAllCheckboxesChecked = Object.entries( this.state.selectedDomains ).every(
				( [ , selected ] ) => selected
			);
			domainsTableColumns.unshift( {
				name: 'select-domain',
				label: (
					<FormCheckbox
						onChange={ this.handleSelectAllDomains }
						checked={ areAllCheckboxesChecked }
						disabled={ this.state.isSavingContactInfo }
					/>
				),
			} );
		}

		return (
			<div className="all-domains__domains-table">
				<div className="all-domains__filter">{ this.renderDomainTableFilterButton() }</div>
				<DomainsTable
					currentRoute={ currentRoute }
					domains={ currentPageDomains }
					handleDomainItemToggle={ this.handleDomainItemToggle }
					domainsTableColumns={ domainsTableColumns }
					isManagingAllSites={ true }
					isContactEmailEditContext={ isContactEmailEditContext }
					goToEditDomainRoot={ this.handleDomainItemClick }
					isLoading={ this.isLoading() }
					purchases={ purchases }
					sites={ sites }
					requestingSiteDomains={ requestingSiteDomains }
					hasLoadedPurchases={ hasLoadedUserPurchases }
					isSavingContactInfo={ isSavingContactInfo }
					domainsDetails={ domainsDetails }
					onSortingChange={ ( sortKey, sortOrder ) => {
						this.setSortedDomains( sortKey, sortOrder, this.getDomainsList() );
					} }
				/>
			</div>
		);
	}

	getDomainsTableColumns( domains ) {
		const { translate, dispatch } = this.props;
		return [
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

						if ( first.isDomainOnlySite && second.isDomainOnlySite ) {
							return 0;
						}

						if ( first.isDomainOnlySite ) {
							return 1 * sortOrder;
						}

						if ( second.isDomainOnlySite ) {
							return -1 * sortOrder;
						}

						return 0;
					},
					( first, second, sortOrder ) => {
						const firstTitle = first?.blogName || first?.siteSlug;
						const secondTitle = second?.blogName || second?.siteSlug;

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
				supportsOrderSwitching: true,
				sortFunctions: [
					( first, second, sortOrder ) => {
						const { listStatusWeight: firstStatusWeight } = resolveDomainStatus(
							first,
							null,
							translate,
							dispatch,
							{
								getMappingErrors: true,
							}
						);
						const { listStatusWeight: secondStatusWeight } = resolveDomainStatus(
							second,
							null,
							translate,
							dispatch,
							{
								getMappingErrors: true,
							}
						);
						return ( ( firstStatusWeight ?? 0 ) - ( secondStatusWeight ?? 0 ) ) * sortOrder;
					},
					getReverseSimpleSortFunctionBy( 'domain' ),
				],
				bubble: countDomainsInOrangeStatus(
					domains.map( ( domain ) =>
						resolveDomainStatus( domain, null, translate, dispatch, {
							getMappingErrors: true,
							siteSlug: domain.siteSlug,
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
			{ name: 'action', label: translate( 'Actions' ) },
		];
	}

	setSortedDomains( sortKey, sortOrder, domains ) {
		if ( ! sortKey || ! sortOrder ) {
			return domains;
		}

		const domainsTableColumns = this.getDomainsTableColumns( domains );

		const selectedColumnDefinition = domainsTableColumns.find(
			( column ) => column.name === sortKey
		);

		return this.setState( {
			sortedDomains: domains.sort( ( first, second ) => {
				let result = 0;
				for ( const sortFunction of selectedColumnDefinition.sortFunctions ) {
					result = sortFunction( first, second, sortOrder );
					if ( 0 !== result ) {
						break;
					}
				}
				return result;
			} ),
		} );
	}

	handleContactInfoTransferLockOptOutChange = ( transferLockOptOut ) => {
		this.setState( { transferLockOptOut } );
	};

	getUpdatedContactInfo = ( domainName, contactInfo ) => {
		const { whoisData } = this.state;
		const updatedContactInfo = whoisData[ domainName ];

		if ( this.props.isContactEmailEditContext ) {
			const { email } = contactInfo;
			updatedContactInfo.email = email;
		}

		return {
			firstName: updatedContactInfo?.fname,
			lastName: updatedContactInfo?.lname,
			organization: updatedContactInfo?.org,
			email: updatedContactInfo?.email,
			phone: updatedContactInfo?.phone,
			address1: updatedContactInfo?.sa1,
			address2: updatedContactInfo?.sa2,
			city: updatedContactInfo?.city,
			state: updatedContactInfo?.state,
			countryCode: updatedContactInfo?.country_code,
			postalCode: updatedContactInfo?.pc,
			fax: updatedContactInfo?.fax,
		};
	};

	handleSaveContactInfo = ( contactInfo ) => {
		this.setState( { isSavingContactInfo: true, contactInfoSaveResults: {} }, () =>
			this.saveContactInfo( contactInfo )
		);
	};

	saveContactInfo = ( contactInfo ) => {
		const selectedDomainNamesList = Object.entries( this.state.selectedDomains ).reduce(
			( list, [ domain, selected ] ) => {
				if ( selected ) {
					list.push( domain );
				}
				return list;
			},
			[]
		);

		if ( selectedDomainNamesList.length === 0 ) {
			this.setState( { isSavingContactInfo: false }, () =>
				this.props.dispatch( infoNotice( this.props.translate( 'No domains selected.' ) ) )
			);
			return;
		}

		if ( this.props.isContactEmailEditContext ) {
			this.props.dispatch(
				recordGoogleEvent(
					'Domain Management',
					'Clicked "Save contact info" Button in ListAll > Bulk edit email address'
				)
			);
			this.props.dispatch(
				recordTracksEvent( 'calypso_domain_management_list_all_save_contact_email_click' )
			);
		}

		const saveWhoisPromises = selectedDomainNamesList.map( ( domainName ) => {
			const updatedContactInfo = this.getUpdatedContactInfo( domainName, contactInfo );
			return wpcom.req
				.post( `/domains/${ domainName }/whois`, {
					whois: updatedContactInfo,
					transfer_lock: this.state.transferLockOptOut,
				} )
				.then( () => {
					this.setState( ( { contactInfoSaveResults } ) => {
						return {
							contactInfoSaveResults: {
								...contactInfoSaveResults,
								[ domainName ]: {
									message: 'Successfully updated email address.',
									type: 'success',
								},
							},
						};
					} );
				} )
				.catch( () => {
					this.setState( ( { contactInfoSaveResults } ) => {
						return {
							contactInfoSaveResults: {
								...contactInfoSaveResults,
								[ domainName ]: {
									message: 'Failed to update email address.',
									type: 'error',
								},
							},
						};
					} );
				} );
		} );

		Promise.allSettled( saveWhoisPromises ).then( () => {
			this.setState( { isSavingContactInfo: false }, () =>
				this.props.dispatch(
					infoNotice( this.props.translate( 'Saving contact info is complete.' ) )
				)
			);
		} );
	};

	renderActionForm() {
		if ( ! this.isLoading() && this.props.isContactEmailEditContext ) {
			const selectedDomainNamesList = Object.entries( this.state.selectedDomains ).reduce(
				( result, [ domain, selected ] ) => {
					if ( selected ) {
						result.push( domain );
					}

					return result;
				},
				[]
			);

			return (
				<Card>
					<CardHeading>
						{ this.props.translate( 'Edit Contact Info For Selected Domains' ) }
					</CardHeading>
					<BulkEditContactInfo
						isDisabled={ this.isLoadingDomainDetails() || this.isLoadingWhoisData() }
						isSubmitting={ this.state.isSavingContactInfo }
						onTransferLockOptOutChange={ this.handleContactInfoTransferLockOptOutChange }
						handleSaveContactInfo={ this.handleSaveContactInfo }
						emailOnly={ ListAllActions.editContactEmail === this.props?.action }
						domainNamesList={ selectedDomainNamesList }
					/>
				</Card>
			);
		}
	}

	filteredDomains() {
		const { sortedDomains } = this.state;
		const { filteredDomainsList, domainsList, isContactEmailEditContext } = this.props;
		if ( ! domainsList ) {
			return [];
		}

		const domains = sortedDomains && sortedDomains.length ? sortedDomains : domainsList;

		if ( isContactEmailEditContext ) {
			return filteredDomainsList;
		}

		const { searchTerm } = this.state;

		// filter on sites we can manage, that aren't `wpcom` type
		return domains.filter( ( domain ) => {
			const isTypeValid = domain.type !== domainTypes.WPCOM;

			if ( searchTerm ) {
				const domainName = domain.name;
				const searchTermLowerCase = searchTerm.toLowerCase();

				return isTypeValid && domainName.includes( searchTermLowerCase );
			}

			return isTypeValid;
		} );
	}

	renderDomainTableFilterInput() {
		return (
			<DomainsTableInputFilter
				onSearch={ ( searchTerm ) => {
					this.setState( {
						searchTerm,
						currentPage: 1,
					} );
				} }
			/>
		);
	}

	renderDomainTableFilterButton() {
		const { context, translate } = this.props;

		const selectedFilter = context?.query?.filter || 'all-domains';
		const nonWpcomDomains = this.mergeFilteredDomainsWithDomainsDetails();

		const filterOptions = [
			{
				label: translate( 'All domains' ),
				value: 'all-domains',
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
				count: filterDomainOnlyDomains( nonWpcomDomains )?.length,
			},
		];

		return (
			<DomainsTableFilterButton
				key="breadcrumb_button_2"
				selectedFilter={ selectedFilter }
				filterOptions={ filterOptions }
				isLoading={ this.isLoadingDomainDetails() }
				disabled={ this.isLoadingDomainDetails() }
			/>
		);
	}

	renderHeader() {
		const { translate } = this.props;

		const item = {
			label: translate( 'All Domains' ),
			subtitle: translate(
				'Manage all your domains. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
				{
					components: {
						learnMoreLink: <InlineSupportLink supportContext="domains" showIcon={ false } />,
					},
				}
			),
			helpBubble: translate(
				'Manage all your domains. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
				{
					components: {
						learnMoreLink: <InlineSupportLink supportContext="domains" showIcon={ false } />,
					},
				}
			),
		};

		const hasNoDomains = this.getDomainsList( 'all-domains' ).length === 0;

		const buttons = hasNoDomains
			? []
			: [
					this.renderDomainTableFilterInput(),
					this.renderDomainTableFilterButton(),
					<OptionsDomainButton key="breadcrumb_button_1" specificSiteActions allDomainsList />,
			  ];

		const mobileButtons = hasNoDomains
			? []
			: [ <OptionsDomainButton key="breadcrumb_button_1" specificSiteActions allDomainsList /> ];

		return <DomainHeader items={ [ item ] } buttons={ buttons } mobileButtons={ mobileButtons } />;
	}

	renderContent() {
		const { domainsList, translate } = this.props;

		if (
			this.props.isContactEmailEditContext &&
			domainsList.length > 0 &&
			this.filteredDomains().length === 0
		) {
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

		const domains = this.getDomainsList();
		return (
			<>
				<div>{ this.renderActionForm() }</div>
				<div className="all-domains__container">
					<QueryAllDomains />
					<>
						<DocumentHead title={ translate( 'Domains', { context: 'A navigation label.' } ) } />
						{ this.renderDomainsList() }
						<Pagination
							page={ this.state.currentPage }
							perPage={ this.state.domainsPerPage }
							total={ domains.length }
							pageClick={ ( currentPage ) => this.setCurrentPage( currentPage ) }
							compact
						/>
					</>
				</div>
			</>
		);
	}

	render() {
		return (
			<Main wideLayout>
				<BodySectionCssClass bodyClass={ [ 'edit__body-white' ] } />
				{ this.renderHeader() }
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

const getFilteredDomainsList = ( state, context ) => {
	const action = parse( context.querystring )?.action;
	const domainsList = getFlatDomainsList( state );
	const domainsDetails = getAllDomains( state );

	if ( ! domainsList ) {
		return [];
	}

	switch ( action ) {
		case ListAllActions.editContactEmail:
		case ListAllActions.editContactInfo:
			return domainsList.filter( ( domain ) => {
				const domainDetails = domainsDetails[ domain?.blogId ]?.find(
					( element ) => element.type === domain.type && element.domain === domain.domain
				);

				return (
					Object.keys( domainDetails ?? {} ).length > 0 &&
					domainTypes.REGISTERED === domain.type &&
					domainDetails?.currentUserCanManage &&
					isDomainUpdateable( domainDetails ) &&
					isDomainInGracePeriod( domainDetails ) &&
					! domainDetails?.isPendingWhoisUpdate
				);
			} );

		default:
			return domainsList.filter( ( domain ) => domain.type !== domainTypes.WPCOM );
	}
};

export default connect(
	( state, { context } ) => {
		const sites = getSitesById( state );
		const action = parse( context.querystring )?.action;

		return {
			action,
			currentRoute: getCurrentRoute( state ),
			domainsList: getFlatDomainsList( state ),
			domainsDetails: getAllDomains( state ),
			filteredDomainsList: getFilteredDomainsList( state, context ),
			isContactEmailEditContext: ListAllActions.editContactEmail === action,
			purchases: getUserPurchases( state ) || [],
			hasLoadedUserPurchases: hasLoadedUserPurchasesFromServer( state ),
			requestingFlatDomains: isRequestingAllDomains( state ),
			requestingSiteDomains: getAllRequestingSiteDomains( state ),
			currentPage: getCurrentNavigationPage( state ),
			sites,
		};
	},
	{
		setCurrentPage: setAllDomainsNavigationPage,
	}
)( localize( AllDomains ) );
