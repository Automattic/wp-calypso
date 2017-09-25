/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import MappedDomain from './mapped-domain';
import RegisteredDomain from './registered-domain';
import SiteRedirect from './site-redirect';
import WpcomDomain from './wpcom-domain';
import Main from 'components/main';
import { getSelectedDomain } from 'lib/domains';
import { registrar as registrarNames } from 'lib/domains/constants';
import { type as domainTypes } from 'lib/domains/constants';
import DomainMainPlaceholder from 'my-sites/domains/domain-management/components/domain/main-placeholder';
import MaintenanceCard from 'my-sites/domains/domain-management/components/domain/maintenance-card';
import Header from 'my-sites/domains/domain-management/components/header';
import paths from 'my-sites/domains/paths';

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
					{ this.props.translate( 'Domain Settings' ) }
				</Header>
				{ this.renderDetails( domain, Details ) }
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

	renderDetails( domain, Details ) {
		const { MAINTENANCE } = registrarNames;

		if ( domain.type === domainTypes.REGISTERED && domain.registrar === MAINTENANCE ) {
			return <MaintenanceCard { ...this.props } />;
		}

		return <Details
			domain={ domain }
			selectedSite={ this.props.selectedSite }
			settingPrimaryDomain={ this.props.domains.settingPrimaryDomain }
		/>;
	},

	goToDomainManagement() {
		page( paths.domainManagementList( this.props.selectedSite.slug ) );
	}
} );

export default localize( Edit );
