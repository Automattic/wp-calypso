/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import DomainMainPlaceholder from 'my-sites/upgrades/domain-management/components/domain/main-placeholder';
import Header from 'my-sites/upgrades/domain-management/components/header';
import Main from 'components/main';
import MappedDomain from './mapped-domain';
import RegisteredDomain from './registered-domain';
import SiteRedirect from './site-redirect';
import WpcomDomain from './wpcom-domain';
import { type as domainTypes } from 'lib/domains/constants';
import paths from 'my-sites/upgrades/paths';
import { getSelectedDomain } from 'lib/domains';

const Edit = React.createClass( {
	render() {
		const domain = this.props.domains && getSelectedDomain( this.props ),
			Details = this.getDetailsForType( domain && domain.type );

		if ( ! domain || ! Details ) {
			return <DomainMainPlaceholder goBack={ this.goToDomainManagement } />;
		}

		return (
			<Main className="domain-management-edit">
				<Header onClick={ this.goToDomainManagement } selectedDomainName={ this.props.selectedDomainName }>
					{ this.translate( 'Domain Settings' ) }
				</Header>

				<Details
					domain={ domain }
					selectedSite={ this.props.selectedSite }
					settingPrimaryDomain={ this.props.domains.settingPrimaryDomain } />
			</Main>
		);
	},

	getDetailsForType( type ) {
		switch ( type ) {
			case domainTypes.MAPPED:
				return MappedDomain;

			case domainTypes.REGISTERED:
				return RegisteredDomain;

			case domainTypes.SITE_REDIRECT:
				return SiteRedirect;

			case domainTypes.WPCOM:
				return WpcomDomain;

			default:
				return null;
		}
	},

	goToDomainManagement() {
		page( paths.domainManagementList( this.props.selectedSite.slug ) );
	}
} );

export default Edit;
