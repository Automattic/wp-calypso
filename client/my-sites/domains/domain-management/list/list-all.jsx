import config from '@automattic/calypso-config';
import { Button, Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { parse } from 'qs';
import { Fragment, Component } from 'react';
import { InView } from 'react-intersection-observer';
import { connect } from 'react-redux';
import CardHeading from 'calypso/components/card-heading';
import DocumentHead from 'calypso/components/data/document-head';
import QueryAllDomains from 'calypso/components/data/query-all-domains';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import Main from 'calypso/components/main';
import { isDomainInGracePeriod, isDomainUpdateable } from 'calypso/lib/domains';
import { type as domainTypes } from 'calypso/lib/domains/constants';
import wpcom from 'calypso/lib/wp';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import { errorNotice, infoNotice, successNotice } from 'calypso/state/notices/actions';
import { getUserPurchases } from 'calypso/state/purchases/selectors';
import canCurrentUserForSites from 'calypso/state/selectors/can-current-user-for-sites';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import getSites from 'calypso/state/selectors/get-sites';
import isRequestingAllDomains from 'calypso/state/selectors/is-requesting-all-domains';
import {
	getAllDomains,
	getAllRequestingSiteDomains,
	getFlatDomainsList,
} from 'calypso/state/sites/domains/selectors';
import { hasAllSitesList } from 'calypso/state/sites/selectors';
import BulkEditContactInfo from './bulk-edit-contact-info';
import DomainItem from './domain-item';
import ListItemPlaceholder from './item-placeholder';
import ListHeader from './list-header';
import { getDomainManagementPath, ListAllActions } from './utils';

import './list-all.scss';

class ListAll extends Component {
	static propTypes = {
		action: PropTypes.string,
		canManageSitesMap: PropTypes.object.isRequired,
		currentRoute: PropTypes.string.isRequired,
		domainsList: PropTypes.array.isRequired,
		filteredDomainsList: PropTypes.array.isRequired,
		sites: PropTypes.object.isRequired,
		addDomainClick: PropTypes.func.isRequired,
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
	};

	renderedQuerySiteDomains = {};

	componentDidUpdate() {
		if ( this.props.isContactEmailEditContext && ! this.isLoadingDomainDetails() ) {
			this.setSelectedDomains();
		}
	}

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

	clickAddDomain = () => {
		this.props.addDomainClick();
		page( '/start/add-domain' );
	};

	handleDomainItemClick = ( domain ) => {
		const { sites, currentRoute } = this.props;
		const site = sites[ domain.blogId ];

		if ( this.props.isContactEmailEditContext ) {
			return;
		}

		page( getDomainManagementPath( domain.name, domain.type, site.slug, currentRoute ) );
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

	shouldRenderDomainItem( domain, domainDetails ) {
		if ( this.props.isContactEmailEditContext ) {
			return (
				Object.keys( domainDetails ?? {} ).length !== 0 &&
				domainTypes.REGISTERED === domain.type &&
				domainDetails?.currentUserCanManage &&
				isDomainUpdateable( domainDetails ) &&
				isDomainInGracePeriod( domainDetails ) &&
				! domainDetails?.isPendingWhoisUpdate
			);
		}

		return true;
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

	getActionResult( domain ) {
		if ( this.props.isContactEmailEditContext ) {
			return this.state.contactInfoSaveResults[ domain ] ?? null;
		}

		return null;
	}

	renderDomainItem( domain, index ) {
		const {
			currentRoute,
			domainsDetails,
			sites,
			requestingSiteDomains,
			isContactEmailEditContext,
		} = this.props;
		const { selectedDomains, isSavingContactInfo } = this.state;
		const domainDetails = this.findDomainDetails( domainsDetails, domain );
		const isLoadingDomainDetails = this.isLoadingDomainDetails();
		const isChecked = ( selectedDomains[ domain.domain ] ?? false ) || isLoadingDomainDetails;
		const actionResult = this.getActionResult( domain.name );

		return (
			<Fragment key={ `domain-item-${ index }-${ domain.name }` }>
				{ domain?.blogId && ! isContactEmailEditContext ? (
					<InView triggerOnce>
						{ ( { inView, ref } ) => (
							<div ref={ ref }>{ inView && this.renderQuerySiteDomainsOnce( domain.blogId ) }</div>
						) }
					</InView>
				) : (
					this.renderQuerySiteDomainsOnce( domain.blogId )
				) }
				{ this.shouldRenderDomainItem( domain, domainDetails ) && (
					<DomainItem
						currentRoute={ currentRoute }
						domain={ domain }
						showDomainDetails={ ! isContactEmailEditContext }
						domainDetails={ domainDetails }
						showCheckbox={ isContactEmailEditContext }
						site={ sites[ domain?.blogId ] }
						isManagingAllSites={ true }
						isLoadingDomainDetails={
							! domainDetails && ( requestingSiteDomains[ domain?.blogId ] ?? false )
						}
						onClick={ this.handleDomainItemClick }
						onToggle={ this.handleDomainItemToggle }
						isChecked={ isChecked }
						disabled={ isLoadingDomainDetails || isSavingContactInfo }
						actionResult={ actionResult }
						isBusy={
							isContactEmailEditContext &&
							( ( isChecked && isSavingContactInfo && null === actionResult ) ||
								isLoadingDomainDetails )
						}
					/>
				) }
			</Fragment>
		);
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

	renderDomainListHeader() {
		const { isContactEmailEditContext } = this.props;
		const { isSavingContactInfo, selectedDomainListHeader } = this.state;
		const isLoadingDomainDetails = this.isLoadingDomainDetails();
		const isChecked = selectedDomainListHeader || isLoadingDomainDetails;

		return (
			<ListHeader
				key="list-header"
				action={ this.props.action }
				disabled={ isLoadingDomainDetails || isSavingContactInfo }
				onToggle={ this.handleDomainListHeaderToggle }
				isChecked={ isChecked }
				isBusy={
					isContactEmailEditContext &&
					( ( isChecked && isSavingContactInfo ) || isLoadingDomainDetails )
				}
				isManagingAllSites={ true }
			/>
		);
	}

	renderDomainsList() {
		if ( this.isLoading() ) {
			return Array.from( { length: 3 } ).map( ( _, n ) => (
				<ListItemPlaceholder key={ `item-${ n }` } />
			) );
		}

		let domainListItems = this.filteredDomains().map( ( domain, index ) => {
			return this.renderDomainItem( domain, index );
		} );

		if ( this.props.isContactEmailEditContext && this.isRequestingSiteDomains() ) {
			domainListItems = [
				...domainListItems,
				<ListItemPlaceholder key="item-is-requesting-site-domains" />,
			];
		}

		return [ this.renderDomainListHeader(), ...domainListItems ];
	}

	renderHeaderButtons() {
		if ( this.props.isContactEmailEditContext ) {
			return;
		}

		return <div className="list-all__heading-buttons">{ this.headerButtons() }</div>;
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
				this.props.infoNotice( this.props.translate( 'No domains selected.' ) )
			);
			return;
		}

		if ( this.props.isContactEmailEditContext ) {
			this.props.saveContactEmailClick();
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
				this.props.infoNotice( this.props.translate( 'Saving contact info is complete.' ) )
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

		return (
			<>
				<div className="list-all__heading">
					<FormattedHeader brandFont headerText={ translate( 'All Domains' ) } align="left" />
					{ this.renderHeaderButtons() }
				</div>
				<div className="list-all__form">{ this.renderActionForm() }</div>
				<div className="list-all__container">
					<QueryAllDomains />
					<QueryUserPurchases />
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

const saveContactEmailClick = () =>
	composeAnalytics(
		recordGoogleEvent(
			'Domain Management',
			'Clicked "Save contact info" Button in ListAll > Bulk edit email address'
		),
		recordTracksEvent( 'calypso_domain_management_list_all_save_contact_email_click' )
	);

const getPurchasesById = ( state ) =>
	( getUserPurchases( state ) || [] ).reduce( ( result, purchase ) => {
		result[ purchase.id ] = purchase;
		return result;
	}, {} );

const getSitesById = ( state ) => {
	return ( getSites( state ) ?? [] ).reduce( ( result, site ) => {
		result[ site.ID ] = site;
		return result;
	}, {} );
};

const getFilteredDomainsList = ( state, context ) => {
	const action = parse( context.querystring )?.action;
	const sites = getSitesById( state );
	const canManageSitesMap = canCurrentUserForSites( state, Object.keys( sites ), 'manage_options' );
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
			return domainsList.filter(
				( domain ) => domain.type !== domainTypes.WPCOM && canManageSitesMap[ domain.blogId ]
			);
	}
};

export default connect(
	( state, { context } ) => {
		const sites = getSitesById( state );
		const purchases = getPurchasesById( state );
		const action = parse( context.querystring )?.action;

		return {
			action,
			canManageSitesMap: canCurrentUserForSites( state, Object.keys( sites ), 'manage_options' ),
			currentRoute: getCurrentRoute( state ),
			domainsList: getFlatDomainsList( state ),
			domainsDetails: getAllDomains( state ),
			filteredDomainsList: getFilteredDomainsList( state, context ),
			hasAllSitesLoaded: hasAllSitesList( state ),
			isContactEmailEditContext: ListAllActions.editContactEmail === action,
			purchases,
			requestingFlatDomains: isRequestingAllDomains( state ),
			requestingSiteDomains: getAllRequestingSiteDomains( state ),
			sites,
		};
	},
	{
		addDomainClick,
		saveContactEmailClick,
		successNotice,
		errorNotice,
		infoNotice,
	}
)( localize( ListAll ) );
