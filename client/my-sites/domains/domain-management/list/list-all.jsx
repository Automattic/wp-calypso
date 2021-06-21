/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { forEach, get, isEmpty, keyBy, keys, reduce, times } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LazyRender from 'react-lazily-render';
import { parse } from 'qs';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import { Button, Card } from '@automattic/components';

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
import { getDomainManagementPath, ListAllActions } from './utils';
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
import BulkEditContactInfo from './bulk-edit-contact-info';
import CardHeading from 'calypso/components/card-heading';
import { isDomainInGracePeriod, isDomainUpdateable } from 'calypso/lib/domains';
import wpcom from 'calypso/lib/wp';

/**
 * Style dependencies
 */
import './list-all.scss';

class ListAll extends Component {
	static propTypes = {
		canManageSitesMap: PropTypes.object.isRequired,
		currentRoute: PropTypes.string.isRequired,
		domainsList: PropTypes.array.isRequired,
		filteredDomainsList: PropTypes.array.isRequired,
		sites: PropTypes.object.isRequired,
		user: PropTypes.object.isRequired,
		addDomainClick: PropTypes.func.isRequired,
		requestingSiteDomains: PropTypes.object,
	};

	state = {
		selectedDomainsSet: false,
		selectedDomains: {},
		transferLockOptOut: false,
		whoisData: {},
	};

	renderedQuerySiteDomains = {};

	componentDidUpdate() {
		if (
			this.shouldSetSelectedDomains() &&
			! this.isLoadingDomainDetails() &&
			! isEmpty( this.props.filteredDomainsList ) &&
			! this.state.selectedDomainsSet
		) {
			this.setSelectedDomains();
		}
	}

	setSelectedDomains = () => {
		this.setState( { selectedDomainsSet: true }, () =>
			forEach( this.props.filteredDomainsList, ( { domain } ) =>
				this.handleDomainItemToggle( domain, true )
			)
		);
	};

	fetchWhoisData = ( domain ) => {
		wpcom
			.undocumented()
			.fetchWhois( domain )
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

		if ( this.shouldShowContactForm() ) {
			return;
		}

		page( getDomainManagementPath( domain.name, domain.type, site.slug, currentRoute ) );
	};

	handleDomainItemToggle = ( domain, selected ) => {
		if ( selected && isEmpty( get( this.state.whoisData, domain, null ) ) ) {
			this.fetchWhoisData( domain );
		}

		this.setState( ( { selectedDomains } ) => {
			return { selectedDomains: { ...selectedDomains, [ domain ]: selected } };
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
			isEmpty( requestingSiteDomains ) ||
			reduce(
				requestingSiteDomains,
				( result, value ) => {
					return result || value;
				},
				false
			)
		);
	}

	isLoadingDomainDetails() {
		return this.isLoading() || this.isRequestingSiteDomains();
	}

	shouldShowContactForm() {
		return this.props.isContactEditContext;
		// return ListAllActions.editContactEmail === this.props?.action;
	}

	shouldSetSelectedDomains() {
		return this.shouldShowContactForm();
	}

	shouldShowCheckbox() {
		return this.shouldShowContactForm();
	}

	shouldShowDomainDetails() {
		return ! this.shouldShowContactForm();
	}

	shouldDefaultToChecked() {
		return this.shouldShowContactForm();
	}

	shouldLazyLoadSiteDomainsDetails() {
		return ! this.shouldShowContactForm();
	}

	shouldRenderDomainItem( domain, domainDetails ) {
		if ( this.shouldShowContactForm() ) {
			return (
				! isEmpty( domainDetails ) &&
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

	renderDomainItem( domain, index ) {
		const { currentRoute, domainsDetails, sites, requestingSiteDomains } = this.props;
		const domainDetails = this.findDomainDetails( domainsDetails, domain );
		const isLoadingDomainDetails = this.isLoadingDomainDetails();

		const { selectedDomains } = this.state;
		const isChecked = ( selectedDomains[ domain.domain ] ?? false ) || isLoadingDomainDetails;

		return (
			<React.Fragment key={ `domain-item-${ index }-${ domain.name }` }>
				{ domain?.blogId && this.shouldLazyLoadSiteDomainsDetails() ? (
					<LazyRender>
						{ ( render ) => ( render ? this.renderQuerySiteDomainsOnce( domain.blogId ) : null ) }
					</LazyRender>
				) : (
					this.renderQuerySiteDomainsOnce( domain.blogId )
				) }
				{ this.shouldRenderDomainItem( domain, domainDetails ) && (
					<DomainItem
						currentRoute={ currentRoute }
						domain={ domain }
						showDomainDetails={ this.shouldShowDomainDetails() }
						domainDetails={ domainDetails }
						showCheckbox={ this.shouldShowCheckbox() }
						site={ sites[ domain?.blogId ] }
						isManagingAllSites={ true }
						isLoadingDomainDetails={
							! domainDetails && ( requestingSiteDomains[ domain?.blogId ] ?? false )
						}
						onClick={ this.handleDomainItemClick }
						onToggle={ this.handleDomainItemToggle }
						isChecked={ isChecked }
						disabeld={ isLoadingDomainDetails }
					/>
				) }
			</React.Fragment>
		);
	}

	renderDomainsList() {
		if ( this.isLoading() ) {
			return times( 3, ( n ) => <ListItemPlaceholder key={ `item-${ n }` } /> );
		}

		let domainListItems = this.filteredDomains().map( ( domain, index ) => {
			return this.renderDomainItem( domain, index );
		} );

		if ( ! this.shouldLazyLoadSiteDomainsDetails() && this.isRequestingSiteDomains() ) {
			domainListItems = [
				...domainListItems,
				<ListItemPlaceholder key="item-is-requesting-site-domains" />,
			];
		}

		return [ <ListHeader key="list-header" action={ this.props.action } />, ...domainListItems ];
	}

	renderHeaderButtons() {
		if ( this.shouldShowContactForm() ) {
			return;
		}

		return <div className="list-all__heading-buttons">{ this.headerButtons() }</div>;
	}

	handleContactInfoTransferLockOptOutChange = ( transferLockOptOut ) => {
		this.setState( { transferLockOptOut } );
	};

	handleSaveContactInfo = ( contactInfo ) => {
		console.log( contactInfo );
		console.log( this.state.transferLockOptOut );
		console.log( this.state.selectedDomains );
		console.log( this.state.whoisData );

		// submit = () => {
		// 	const { domainNamesList } = this.props;
		// 	const { contactDetails, transferLock } = this.state;
		//
		// 	console.log( domainNamesList );
		// 	console.log( contactDetails );
		// 	console.log( transferLock );
		//
		//
		// 	// return wpcom
		// 	// .undocumented()
		// 	// .updateWhois( domain, whoisData, transferLock )
		// 	// .then( ( data ) => {
		// 	// 	dispatch( updateWhois( domain, whoisData ) );
		// 	// 	dispatch( {
		// 	// 		type: DOMAIN_MANAGEMENT_WHOIS_SAVE_SUCCESS,
		// 	// 		domain,
		// 	// 		data,
		// 	// 	} );
		// 	// } )
		// 	// .catch( ( error ) => {
		// 	// 	dispatch( {
		// 	// 		type: DOMAIN_MANAGEMENT_WHOIS_SAVE_FAILURE,
		// 	// 		domain,
		// 	// 		error,
		// 	// 	} );
		// 	// } );
		//
		// 	const saveWhoisPromises = map( domainNamesList, ( domainName ) => {
		// 		return wpcom.updateWhois( domainName, contactDetails, transferLock ).then( ( data ) => {
		// 			console.log( data );
		// 		} );
		// 	} );
		//
		// 	Promise.allSettled( saveWhoisPromises ).then( ( results ) => {
		// 		console.log( results );
		// 	} );
		//
		// 	// this.props.domainNamesList.forEach( ( domainName ) => {
		// 	// 	this.setState(
		// 	// 		{
		// 	// 			formSubmitting: true,
		// 	// 		},
		// 	// 		() => {
		// 	// 			this.props.saveWhois( domainName, contactDetails, transferLock );
		// 	// 		}
		// 	// 	);
		// 	// } );
		// };
	};

	renderActionForm() {
		if ( ! this.isLoading() && this.shouldShowContactForm() ) {
			return (
				<Card>
					<CardHeading>
						{ this.props.translate( 'Edit Contact Info For Selected Domains' ) }
					</CardHeading>
					<BulkEditContactInfo
						isDisabled={ this.isLoadingDomainDetails() }
						isSubmitting={ false }
						onTransferLockOptOutChange={ this.handleContactInfoTransferLockOptOutChange }
						handleSaveContactInfo={ this.handleSaveContactInfo }
						emailOnly={ ListAllActions.editContactEmail === this.props?.action }
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
		const { domainsList, translate, user } = this.props;

		if (
			this.shouldShowContactForm() &&
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

const getFilteredDomainsList = ( state, context ) => {
	const action = parse( context.querystring )?.action;
	const sites = keyBy( getSites( state ), 'ID' );
	const canManageSitesMap = canCurrentUserForSites( state, keys( sites ), 'manage_options' );
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
					! isEmpty( domainDetails ) &&
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
		const sites = keyBy( getSites( state ), 'ID' );
		const user = getCurrentUser( state );
		const purchases = keyBy( getUserPurchases( state, user?.ID ) || [], 'id' );
		const action = parse( context.querystring )?.action;

		return {
			action,
			canManageSitesMap: canCurrentUserForSites( state, keys( sites ), 'manage_options' ),
			currentRoute: getCurrentRoute( state ),
			domainsList: getFlatDomainsList( state ),
			domainsDetails: getAllDomains( state ),
			filteredDomainsList: getFilteredDomainsList( state, context ),
			purchases,
			requestingFlatDomains: isRequestingAllDomains( state ),
			requestingSiteDomains: getAllRequestingSiteDomains( state ),
			sites,
			hasAllSitesLoaded: hasAllSitesList( state ),
			user,
			isContactEditContext: ListAllActions.editContactEmail === action,
		};
	},
	{
		addDomainClick,
	}
)( localize( ListAll ) );
