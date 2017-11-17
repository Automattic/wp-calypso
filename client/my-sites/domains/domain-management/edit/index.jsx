/** @format */

/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import DomainMainPlaceholder from 'my-sites/domains/domain-management/components/domain/main-placeholder';
import { getSelectedDomain } from 'lib/domains';
import Header from 'my-sites/domains/domain-management/components/header';
import InboundTransferEmailVerificationCard from 'my-sites/domains/domain-management/components/inbound-transfer-verification';
import { localize } from 'i18n-calypso';
import Main from 'components/main';
import MaintenanceCard from 'my-sites/domains/domain-management/components/domain/maintenance-card';
import MappedDomain from './mapped-domain';
import paths from 'my-sites/domains/paths';
import RegisteredDomain from './registered-domain';
import {
	registrar as registrarNames,
	transferStatus,
	type as domainTypes,
} from 'lib/domains/constants';
import SiteRedirect from './site-redirect';
import Transfer from './transfer';
import WpcomDomain from './wpcom-domain';

class Edit extends React.Component {
	render() {
		const domain = this.props.domains && getSelectedDomain( this.props ),
			Details = this.getDetailsForType( domain && domain.type );

		if ( ! domain || ! Details ) {
			return <DomainMainPlaceholder goBack={ this.goToDomainManagement } />;
		}

		return (
			<Main className="domain-management-edit">
				<Header
					onClick={ this.goToDomainManagement }
					selectedDomainName={ this.props.selectedDomainName }
				>
					{ this.props.translate( 'Domain Settings' ) }
				</Header>
				{ this.renderInboundTransferEmailNotice() }
				{ this.renderDetails( domain, Details ) }
			</Main>
		);
	}

	renderInboundTransferEmailNotice = () => {
		const domain = this.props.domains && getSelectedDomain( this.props );
		const isPendingVerification = transferStatus.PENDING_OWNER === get( domain, 'transferStatus' );

		if ( ! isPendingVerification ) {
			return null;
		}

		return (
			<InboundTransferEmailVerificationCard
				selectedDomainName={ this.props.selectedDomainName }
				selectedSiteSlug={ this.props.selectedSite.slug }
			/>
		);
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

		if ( domain.type === domainTypes.REGISTERED && domain.registrar === MAINTENANCE ) {
			return <MaintenanceCard { ...this.props } />;
		}

		return (
			<Details
				domain={ domain }
				selectedSite={ this.props.selectedSite }
				settingPrimaryDomain={ this.props.domains.settingPrimaryDomain }
			/>
		);
	};

	goToDomainManagement = () => {
		page( paths.domainManagementList( this.props.selectedSite.slug ) );
	};
}

export default localize( Edit );
