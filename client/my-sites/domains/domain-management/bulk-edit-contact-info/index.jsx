/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import { keyBy, keys, merge } from 'lodash';

/**
 * Internal dependencies
 */
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import Main from 'calypso/components/main';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import DomainContactDetails from 'calypso/my-sites/checkout/composite-checkout/components/domain-contact-details';
import canCurrentUserForSites from 'calypso/state/selectors/can-current-user-for-sites';
import {
	getAllDomains,
	getAllRequestingSiteDomains,
	getFlatDomainsList,
} from 'calypso/state/sites/domains/selectors';
import isRequestingAllDomains from 'calypso/state/selectors/is-requesting-all-domains';
import { hasAllSitesList } from 'calypso/state/sites/selectors';
import getSites from 'calypso/state/selectors/get-sites';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getUserPurchases } from 'calypso/state/purchases/selectors';
import { type as domainTypes } from 'calypso/lib/domains/constants';
import { isDomainInGracePeriod, isDomainUpdateable } from 'calypso/lib/domains';

class BulkEditContactInfo extends React.Component {
	static propTypes = {
		canManageSitesMap: PropTypes.object.isRequired,
		currentRoute: PropTypes.string.isRequired,
		domainsList: PropTypes.array.isRequired,
		sites: PropTypes.object.isRequired,
		user: PropTypes.object.isRequired,
		addDomainClick: PropTypes.func.isRequired,
		requestingSiteDomains: PropTypes.object,
	};

	constructor( props ) {
		super( props );

		this.state = {
			contactDetails: {},
		};
	}

	isLoading() {
		const { domainsList, requestingFlatDomains, hasAllSitesLoaded } = this.props;
		return ! hasAllSitesLoaded || ( requestingFlatDomains && domainsList.length === 0 );
	}

	filteredDomainNames() {
		const { domainsList, canManageSitesMap, domainsDetails } = this.props;
		if ( ! domainsDetails ) {
			return [];
		}

		// console.log( domainsList );
		// console.log( domainsDetails );

		return domainsList.filter( ( domain ) => {
			console.log( domain );

			const domainDetail = domainsDetails[ domain.blogId ].filter(
				( d ) => d.name === domain.domain
			)[ 0 ];

			console.log( domainDetail );
			console.log( '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^' );

			return (
				domainTypes.REGISTERED === domainDetail.type &&
				domainDetail.currentUserCanManage &&
				isDomainUpdateable( domainDetail ) &&
				! isDomainInGracePeriod( domainDetail ) &&
				! domainDetail?.isPendingWhoisUpdate
			);
		} );

		// return domainsDetails.filter(
		// 	( domain ) =>
		// 		domainTypes.REGISTERED === domain.type &&
		// 		domain?.currentUserCanManage &&
		// 		isDomainUpdateable( domain ) &&
		// 		! isDomainInGracePeriod( domain ) &&
		// 		! domain?.isPendingWhoisUpdate
		// );
		//
		// // filter on sites we can manage, that aren't `wpcom` type
		// return domainsList
		// 	.filter(
		// 		( domain ) => domain.type !== domainTypes.WPCOM && canManageSitesMap[ domain.blogId ]
		// 	)
		// 	.map( ( domain ) => domain.domain );
	}

	updateDomainContactFields = ( data ) => {
		const newContactDetails = merge( {}, this.state.contactDetails, data );
		this.setState( { contactDetails: newContactDetails } );
	};

	render() {
		if ( this.isLoading() ) {
			return <DomainMainPlaceholder goBack={ this.goToContactsPrivacy } />;
		}

		// console.log( this.props.domainsList );
		// console.log( this.props.domainsDetails );
		// console.log( this.props );
		console.log( this.filteredDomainNames() );
		console.log( '=========================' );

		const domainNames = []; //this.filteredDomainNames();
		const contactDetailsErrors = {};

		return (
			<Main className="bulk-edit-contact-info">
				<Header
					// onClick={ this.goToContactsPrivacy }
					// // selectedDomainName={ this.props.selectedDomainName }
					isManagingAllDomains={ true }
				>
					{ this.props.translate( 'Edit Contact Info For All Domains' ) }
				</Header>
				<DomainContactDetails
					domainNames={ domainNames }
					contactDetails={ this.state.contactDetails }
					contactDetailsErrors={ contactDetailsErrors }
					updateDomainContactFields={ this.updateDomainContactFields }
					shouldShowContactDetailsValidationErrors={ false }
					isDisabled={ false }
					isLoggedOutCart={ false }
				/>
			</Main>
		);
	}
}

export default connect( ( state ) => {
	const sites = keyBy( getSites( state ), 'ID' );
	const user = getCurrentUser( state );
	const purchases = keyBy( getUserPurchases( state, user?.ID ) || [], 'id' );

	return {
		currentRoute: getCurrentRoute( state ),
		// isRequestingWhois: isRequestingWhois( state, ownProps.selectedDomainName ),

		canManageSitesMap: canCurrentUserForSites( state, keys( sites ), 'manage_options' ),
		domainsList: getFlatDomainsList( state ),
		domainsDetails: getAllDomains( state ),
		purchases,
		requestingFlatDomains: isRequestingAllDomains( state ),
		requestingSiteDomains: getAllRequestingSiteDomains( state ),
		sites,
		hasAllSitesLoaded: hasAllSitesList( state ),
		user,
	};
} )( localize( BulkEditContactInfo ) );
