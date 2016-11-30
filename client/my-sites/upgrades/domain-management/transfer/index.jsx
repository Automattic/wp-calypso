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

class Transfer extends React.Component {
	render() {
		const slug = this.props.selectedSite.slug,
			domainName = this.props.selectedDomainName;
		return (
		<Main className="domain-management-transfer">
			<Header
				selectedDomainName={ domainName }
				backHref={ paths.domainManagementEdit( slug, domainName ) }>
				{ this.props.translate( 'Transfer Domain' ) }
			</Header>
			<VerticalNav>
				<VerticalNavItem path={
					paths.domainManagementTransferOut( slug, domainName )
				}>
					{ this.props.translate( 'Transfer to another registrar' ) }
				</VerticalNavItem>
				<VerticalNavItem path={
					paths.domainManagementTransferToAnotherUser( slug, domainName )
				}>
					{ this.props.translate( 'Transfer to another user' ) }
				</VerticalNavItem>
			</VerticalNav>
		</Main>
		);
	}
}

export default localize( Transfer );
