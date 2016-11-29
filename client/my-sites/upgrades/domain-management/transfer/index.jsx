/**
 * External Dependencies
 **/
import React from 'react';

/**
 * Internal Dependencies
 **/
import { localize } from 'i18n-calypso';
import paths from 'my-sites/upgrades/paths';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';

class Transfer extends React.Component {
	render() {
		return (
		<VerticalNav>
			<VerticalNavItem path={
				paths.domainManagementTransferOut( this.props.selectedSite.slug, this.props.selectedDomainName )
			}>
				{ this.props.translate( 'Transfer Out' ) }
			</VerticalNavItem>
			<VerticalNavItem path={
				paths.domainManagementTransferToAnotherUser( this.props.selectedSite.slug, this.props.selectedDomainName )
			}>
				{ this.props.translate( 'Transfer to another user' ) }
			</VerticalNavItem>
		</VerticalNav>
		);
	}
}

export default localize( Transfer );
