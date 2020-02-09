/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import DomainMainPlaceholder from 'my-sites/domains/domain-management/components/domain/main-placeholder';
import { getSelectedDomain } from 'lib/domains';
import Header from 'my-sites/domains/domain-management/components/header';
import { localize } from 'i18n-calypso';
import Main from 'components/main';
import MaintenanceCard from 'my-sites/domains/domain-management/components/domain/maintenance-card';
import MappedDomain from './mapped-domain';
import { domainManagementList } from 'my-sites/domains/paths';
import RegisteredDomain from './registered-domain';
import { registrar as registrarNames, type as domainTypes } from 'lib/domains/constants';
import SiteRedirect from './site-redirect';
import Transfer from './transfer';
import WpcomDomain from './wpcom-domain';
import WpcomDomainType from './domain-types/wpcom-domain-type';
import RegisteredDomainType from './domain-types/registered-domain-type';
import config from 'config';

/**
 * Style dependencies
 */
import './style.scss';

class Edit extends React.Component {
	render() {
		const domain = this.props.domains && getSelectedDomain( this.props );

		let Details;

		if ( config.isEnabled( 'domains/new-status-design' ) ) {
			Details = this.getDomainDetailsForType( domain && domain.type );
		} else {
			Details = this.getDetailsForType( domain && domain.type );
		}

		if ( ! domain || ! Details ) {
			return <DomainMainPlaceholder goBack={ this.goToDomainManagement } />;
		}

		return (
			<Main>
				<Header
					onClick={ this.goToDomainManagement }
					selectedDomainName={ this.props.selectedDomainName }
				>
					{ this.props.translate( 'Domain Settings' ) }
				</Header>
				{ this.renderDetails( domain, Details ) }
			</Main>
		);
	}

	getDomainDetailsForType = type => {
		switch ( type ) {
			case domainTypes.REGISTERED:
				return RegisteredDomainType;
			case domainTypes.WPCOM:
				return WpcomDomainType;
			default:
				return null;
		}
	};

	getDetailsForType = type => {
		switch ( type ) {
			case domainTypes.MAPPED:
				return MappedDomain;

			case domainTypes.REGISTERED:
				return RegisteredDomain;

			case domainTypes.SITE_REDIRECT:
				return SiteRedirect;

			case domainTypes.TRANSFER:
				return Transfer;

			case domainTypes.WPCOM:
				return WpcomDomain;

			default:
				return null;
		}
	};

	renderDetails = ( domain, Details ) => {
		const { MAINTENANCE } = registrarNames;
		const { REGISTERED, TRANSFER } = domainTypes;

		if ( includes( [ REGISTERED, TRANSFER ], domain.type ) && domain.registrar === MAINTENANCE ) {
			return (
				<MaintenanceCard
					selectedDomainName={ this.props.selectedDomainName }
					tldMaintenanceEndTime={ domain.tldMaintenanceEndTime }
				/>
			);
		}

		return <Details domain={ domain } selectedSite={ this.props.selectedSite } />;
	};

	goToDomainManagement = () => {
		page( domainManagementList( this.props.selectedSite.slug ) );
	};
}

export default localize( Edit );
