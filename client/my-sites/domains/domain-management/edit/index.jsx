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
import { getSelectedDomain, getDomainTypeText } from 'lib/domains';
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
import MappedDomainType from './domain-types/mapped-domain-type';
import TransferInDomainType from './domain-types/transfer-in-domain-type';
import config from 'config';

/**
 * Style dependencies
 */
import './style.scss';

class Edit extends React.Component {
	render() {
		const domain = this.props.domains && getSelectedDomain( this.props );

		const Details = this.getDetailsForType( domain && domain.type );

		if ( ! domain || ! Details ) {
			return <DomainMainPlaceholder goBack={ this.goToDomainManagement } />;
		}

		return (
			<Main>
				<Header
					onClick={ this.goToDomainManagement }
					selectedDomainName={ this.props.selectedDomainName }
				>
					{ this.props.translate( '%(domainType)s Settings', {
						args: {
							domainType: getDomainTypeText( domain ),
						},
					} ) }
				</Header>
				{ this.renderDetails( domain, Details ) }
			</Main>
		);
	}

	getDetailsForType = type => {
		const newStatusDesign = config.isEnabled( 'domains/new-status-design' );

		switch ( type ) {
			case domainTypes.MAPPED:
				return newStatusDesign ? MappedDomainType : MappedDomain;

			case domainTypes.REGISTERED:
				return newStatusDesign ? RegisteredDomainType : RegisteredDomain;

			case domainTypes.SITE_REDIRECT:
				return SiteRedirect;

			case domainTypes.TRANSFER:
				return newStatusDesign ? TransferInDomainType : Transfer;

			case domainTypes.WPCOM:
				return newStatusDesign ? WpcomDomainType : WpcomDomain;

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
