import { localize } from 'i18n-calypso';
import page from 'page';
import { Component } from 'react';
import { connect } from 'react-redux';
import Main from 'calypso/components/main';
import { getSelectedDomain, getDomainTypeText } from 'calypso/lib/domains';
import {
	registrar as registrarNames,
	type as domainTypes,
	domainInfoContext,
} from 'calypso/lib/domains/constants';
import { getWpcomDomain } from 'calypso/lib/domains/get-wpcom-domain';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import MaintenanceCard from 'calypso/my-sites/domains/domain-management/components/domain/maintenance-card';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import { getCurrentRoute } from 'calypso/state/selectors/get-current-route';
import isDomainOnlySite from 'calypso/state/selectors/is-domain-only-site';
import MappedDomainType from './domain-types/mapped-domain-type';
import RegisteredDomainType from './domain-types/registered-domain-type';
import SiteRedirectType from './domain-types/site-redirect-type';
import TransferInDomainType from './domain-types/transfer-in-domain-type';
import WpcomDomainType from './domain-types/wpcom-domain-type';

import './style.scss';

class Edit extends Component {
	render() {
		const domain = this.props.domains && getSelectedDomain( this.props );

		const Details = this.getDetailsForType( domain && domain.type );

		if ( ! domain || ! Details ) {
			return <DomainMainPlaceholder goBack={ this.goToDomainManagement } />;
		}

		return (
			<Main>
				<Header onClick={ this.goToDomainManagement }>
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
			return this.props.translate( 'Parked Domain' );
		}
		return getDomainTypeText( domain, this.props.translate, domainInfoContext.PAGE_TITLE );
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

		if ( [ REGISTERED, TRANSFER ].includes( domain.type ) && domain.registrar === MAINTENANCE ) {
			return (
				<MaintenanceCard
					selectedDomainName={ this.props.selectedDomainName }
					tldMaintenanceEndTime={ domain.tldMaintenanceEndTime }
				/>
			);
		}

		const wpcomDomain = getWpcomDomain( this.props.domains );

		return (
			<Details
				domain={ domain }
				wpcomDomainName={ wpcomDomain?.domain }
				selectedSite={ this.props.selectedSite }
			/>
		);
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
