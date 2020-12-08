/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React from 'react';
import page from 'page';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import { getSelectedDomain, getDomainTypeText } from 'calypso/lib/domains';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import { localize } from 'i18n-calypso';
import Main from 'calypso/components/main';
import MaintenanceCard from 'calypso/my-sites/domains/domain-management/components/domain/maintenance-card';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { registrar as registrarNames, type as domainTypes } from 'calypso/lib/domains/constants';
import SiteRedirectType from './domain-types/site-redirect-type';
import WpcomDomainType from './domain-types/wpcom-domain-type';
import RegisteredDomainType from './domain-types/registered-domain-type';
import MappedDomainType from './domain-types/mapped-domain-type';
import TransferInDomainType from './domain-types/transfer-in-domain-type';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';

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
							domainType: this.getDomainTypeText( domain ),
						},
					} ) }
				</Header>
				{ this.renderDetails( domain, Details ) }
			</Main>
		);
	}

	getDomainTypeText( domain ) {
		if ( this.props.hasDomainOnlySite ) {
			return 'Parked Domain';
		}
		return getDomainTypeText( domain );
	}

	getDetailsForType = ( type ) => {
		switch ( type ) {
			case domainTypes.MAPPED:
				return MappedDomainType;

			case domainTypes.REGISTERED:
				return RegisteredDomainType;

			case domainTypes.SITE_REDIRECT:
				return SiteRedirectType;

			case domainTypes.TRANSFER:
				return TransferInDomainType;

			case domainTypes.WPCOM:
				return WpcomDomainType;

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
		page( domainManagementList( this.props.selectedSite.slug, this.props.currentRoute ) );
	};
}

export default connect( ( state, ownProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		hasDomainOnlySite: isDomainOnlySite( state, ownProps.selectedSite.ID ),
	};
} )( localize( Edit ) );
