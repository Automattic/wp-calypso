/**
 * External Dependencies
 **/
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 **/
import DomainMainPlaceholder from 'my-sites/upgrades/domain-management/components/domain/main-placeholder';
import Header from 'my-sites/upgrades/domain-management/components/header';
import Main from 'components/main';
import { getSelectedDomain } from 'lib/domains';
import paths from 'my-sites/upgrades/paths';

const EditSiteAddress = React.createClass( {
	render() {
		const domain = getSelectedDomain( this.props );

		if ( ! domain ) {
			return <DomainMainPlaceholder goBack={ this.goToDomainManagement } />;
		}

		return (
			<Main>
				<Header onClick={ this.goToDomainManagement } selectedDomainName={ this.props.selectedDomainName }>
					{ this.translate( 'Domain Settings' ) }
				</Header>
			</Main>
		);
	},

	goToDomainManagement() {
		page( paths.domainManagementList( this.props.selectedSite.domain ) );
	}
} );

export default EditSiteAddress;
