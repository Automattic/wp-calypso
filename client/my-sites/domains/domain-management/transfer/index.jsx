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
import { getSelectedSiteId } from 'client/state/ui/selectors';
import Header from 'client/my-sites/domains/domain-management/components/header';
import { isDomainOnlySite, isSiteAutomatedTransfer } from 'client/state/selectors';
import { localize } from 'i18n-calypso';
import Main from 'client/components/main';
import paths from 'client/my-sites/domains/paths';
import VerticalNav from 'client/components/vertical-nav';
import VerticalNavItem from 'client/components/vertical-nav/item';

function Transfer( props ) {
	const { isAutomatedTransfer, isDomainOnly, selectedSite, selectedDomainName, translate } = props;
	const slug = get( selectedSite, 'slug' );

	return (
		<Main className="domain-management-transfer">
			<Header
				selectedDomainName={ selectedDomainName }
				backHref={ paths.domainManagementEdit( slug, selectedDomainName ) }
			>
				{ translate( 'Transfer Domain' ) }
			</Header>
			<VerticalNav>
				<VerticalNavItem path={ paths.domainManagementTransferOut( slug, selectedDomainName ) }>
					{ translate( 'Transfer to another registrar' ) }
				</VerticalNavItem>
				{ ! isAutomatedTransfer &&
					! isDomainOnly && (
						<VerticalNavItem
							path={ paths.domainManagementTransferToAnotherUser( slug, selectedDomainName ) }
						>
							{ translate( 'Transfer to another user' ) }
						</VerticalNavItem>
					) }
				{ ! isAutomatedTransfer && (
					<VerticalNavItem
						path={ paths.domainManagementTransferToOtherSite( slug, selectedDomainName ) }
					>
						{ translate( 'Transfer to another WordPress.com site' ) }
					</VerticalNavItem>
				) }
			</VerticalNav>
		</Main>
	);
}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	return {
		isAutomatedTransfer: isSiteAutomatedTransfer( state, siteId ),
		isDomainOnly: isDomainOnlySite( state, siteId ),
	};
} )( localize( Transfer ) );
