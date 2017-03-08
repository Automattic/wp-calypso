/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { localize } from 'i18n-calypso';
import paths from 'my-sites/upgrades/paths';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import Header from 'my-sites/upgrades/domain-management/components/header';
import Main from 'components/main';
import { get } from 'lodash';

function Transfer( props ) {
	const { selectedSite, selectedDomainName, translate } = props;
	const slug = get( selectedSite, 'slug' );
	const canTransferDomain = ! get( selectedSite, 'options.is_automated_transfer', false );

	return (
		<Main className="domain-management-transfer">
			<Header
				selectedDomainName={ selectedDomainName }
				backHref={ paths.domainManagementEdit( slug, selectedDomainName ) }>
				{ translate( 'Transfer Domain' ) }
			</Header>
			<VerticalNav>
				<VerticalNavItem path={
					paths.domainManagementTransferOut( slug, selectedDomainName )
				}>
					{ translate( 'Transfer to another registrar' ) }
				</VerticalNavItem>
					{ canTransferDomain &&
						<VerticalNavItem path={ paths.domainManagementTransferToAnotherUser( slug, selectedDomainName ) }>
							{ translate( 'Transfer to another user' ) }
						</VerticalNavItem> }
			</VerticalNav>
		</Main>
	);
}

export default localize( Transfer );
