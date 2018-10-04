/** @format */
/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React from 'react';

/**
 * Internal Dependencies
 */
import { get } from 'lodash';
import { getSelectedSiteId } from 'state/ui/selectors';
import Header from 'my-sites/domains/domain-management/components/header';
import getPrimaryDomainBySiteId from 'state/selectors/get-primary-domain-by-site-id';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import isPrimaryDomainBySiteId from 'state/selectors/is-primary-domain-by-site-id';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { localize } from 'i18n-calypso';
import Main from 'components/main';
import {
	domainManagementEdit,
	domainManagementTransferOut,
	domainManagementTransferToAnotherUser,
	domainManagementTransferToOtherSite,
} from 'my-sites/domains/paths';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';

function Transfer( props ) {
	const {
		isAtomic,
		isDomainOnly,
		isPrimaryDomain,
		selectedSite,
		selectedDomainName,
		translate,
	} = props;

	const slug = get( selectedSite, 'slug' );

	return (
		<Main className="domain-management-transfer">
			<Header
				selectedDomainName={ selectedDomainName }
				backHref={ domainManagementEdit( slug, selectedDomainName ) }
			>
				{ translate( 'Transfer Domain' ) }
			</Header>
			<VerticalNav>
				<VerticalNavItem path={ domainManagementTransferOut( slug, selectedDomainName ) }>
					{ translate( 'Transfer to another registrar' ) }
				</VerticalNavItem>
				{ ! isAtomic &&
					! isDomainOnly && (
						<VerticalNavItem
							path={ domainManagementTransferToAnotherUser( slug, selectedDomainName ) }
						>
							{ translate( 'Transfer to another user' ) }
						</VerticalNavItem>
					) }

				{ ( ( isAtomic && ! isPrimaryDomain ) || ! isAtomic ) && ( // Simple and Atomic (not primary domain )
					<VerticalNavItem path={ domainManagementTransferToOtherSite( slug, selectedDomainName ) }>
						{ translate( 'Transfer to another WordPress.com site' ) }
					</VerticalNavItem>
				) }
			</VerticalNav>
		</Main>
	);
}

export default connect( ( state, ownProps ) => {
	const siteId = getSelectedSiteId( state );
	return {
		isAtomic: isSiteAutomatedTransfer( state, siteId ),
		isDomainOnly: isDomainOnlySite( state, siteId ),
		primaryDomain: getPrimaryDomainBySiteId( state, siteId ),
		isPrimaryDomain: isPrimaryDomainBySiteId( state, siteId, ownProps.selectedDomainName ),
	};
} )( localize( Transfer ) );
