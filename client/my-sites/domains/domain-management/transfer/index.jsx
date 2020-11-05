/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React from 'react';

/**
 * Internal Dependencies
 */
import { get } from 'lodash';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import isPrimaryDomainBySiteId from 'calypso/state/selectors/is-primary-domain-by-site-id';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { localize } from 'i18n-calypso';
import Main from 'calypso/components/main';
import {
	domainManagementEdit,
	domainManagementTransferOut,
	domainManagementTransferToAnotherUser,
	domainManagementTransferToOtherSite,
} from 'calypso/my-sites/domains/paths';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getSelectedDomain, isMappedDomain } from 'calypso/lib/domains';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import { hasLoadedSiteDomains } from 'calypso/state/sites/domains/selectors';

function Transfer( props ) {
	const {
		isAtomic,
		isDomainOnly,
		isMapping,
		isPrimaryDomain,
		selectedSite,
		selectedDomainName,
		currentRoute,
		translate,
	} = props;
	const slug = get( selectedSite, 'slug' );

	if ( props.isRequestingSiteDomains || ! props.hasSiteDomainsLoaded ) {
		return (
			<DomainMainPlaceholder
				backHref={ domainManagementEdit( slug, selectedDomainName, currentRoute ) }
			/>
		);
	}

	return (
		<Main>
			<Header
				selectedDomainName={ selectedDomainName }
				backHref={ domainManagementEdit( slug, selectedDomainName, currentRoute ) }
			>
				{ isMapping ? translate( 'Transfer Mapping' ) : translate( 'Transfer Domain' ) }
			</Header>
			<VerticalNav>
				{ ! isMapping && (
					<VerticalNavItem
						path={ domainManagementTransferOut( slug, selectedDomainName, currentRoute ) }
					>
						{ translate( 'Transfer to another registrar' ) }
					</VerticalNavItem>
				) }
				{ ! isDomainOnly && (
					<VerticalNavItem
						path={ domainManagementTransferToAnotherUser( slug, selectedDomainName, currentRoute ) }
					>
						{ translate( 'Transfer to another user' ) }
					</VerticalNavItem>
				) }

				{ ( ( isAtomic && ! isPrimaryDomain ) || ! isAtomic ) && ( // Simple and Atomic (not primary domain )
					<VerticalNavItem
						path={ domainManagementTransferToOtherSite( slug, selectedDomainName, currentRoute ) }
					>
						{ translate( 'Transfer to another WordPress.com site' ) }
					</VerticalNavItem>
				) }
			</VerticalNav>
		</Main>
	);
}

export default connect( ( state, ownProps ) => {
	const domain = getSelectedDomain( ownProps );
	const siteId = getSelectedSiteId( state );
	return {
		currentRoute: getCurrentRoute( state ),
		hasSiteDomainsLoaded: hasLoadedSiteDomains( state, siteId ),
		isAtomic: isSiteAutomatedTransfer( state, siteId ),
		isDomainOnly: isDomainOnlySite( state, siteId ),
		isMapping: Boolean( domain ) && isMappedDomain( domain ),
		isPrimaryDomain: isPrimaryDomainBySiteId( state, siteId, ownProps.selectedDomainName ),
		primaryDomain: getPrimaryDomainBySiteId( state, siteId ),
	};
} )( localize( Transfer ) );
