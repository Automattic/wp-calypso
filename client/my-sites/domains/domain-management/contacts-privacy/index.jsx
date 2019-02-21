/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import ContactsPrivacyCard from './card';
import DomainMainPlaceholder from 'my-sites/domains/domain-management/components/domain/main-placeholder';
import Header from 'my-sites/domains/domain-management/components/header';
import Main from 'components/main';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import {
	domainManagementEdit,
	domainManagementEditContactInfo,
	domainManagementManageConsent,
} from 'my-sites/domains/paths';
import { getSelectedDomain } from 'lib/domains';
import { findRegistrantWhois, findPrivacyServiceWhois } from 'lib/domains/whois/utils';

class ContactsPrivacy extends React.PureComponent {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		whois: PropTypes.object.isRequired,
	};

	render() {
		if ( this.isDataLoading() ) {
			return <DomainMainPlaceholder goBack={ this.goToEdit } />;
		}

		const { translate, whois } = this.props;
		const domain = getSelectedDomain( this.props );
		const { hasPrivacyProtection, privateDomain, privacyAvailable, currentUserCanManage } = domain;
		const canManageConsent =
			config.isEnabled( 'domains/gdpr-consent-page' ) && domain.supportsGdprConsentManagement;
		const contactInformation = privateDomain
			? findPrivacyServiceWhois( whois.data )
			: findRegistrantWhois( whois.data );

		return (
			<Main className="contacts-privacy">
				<Header onClick={ this.goToEdit } selectedDomainName={ this.props.selectedDomainName }>
					{ privacyAvailable ? translate( 'Contacts and Privacy' ) : translate( 'Contacts' ) }
				</Header>

				<VerticalNav>
					<ContactsPrivacyCard
						contactInformation={ contactInformation }
						selectedDomainName={ this.props.selectedDomainName }
						selectedSite={ this.props.selectedSite }
						hasPrivacyProtection={ hasPrivacyProtection }
						privateDomain={ privateDomain }
						privacyAvailable={ privacyAvailable }
						currentUserCanManage={ currentUserCanManage }
					/>

					<VerticalNavItem
						path={ domainManagementEditContactInfo(
							this.props.selectedSite.slug,
							this.props.selectedDomainName
						) }
					>
						{ translate( 'Edit Contact Info' ) }
					</VerticalNavItem>

					{ canManageConsent && (
						<VerticalNavItem
							path={ domainManagementManageConsent(
								this.props.selectedSite.slug,
								this.props.selectedDomainName
							) }
						>
							{ translate( 'Manage Consent for Personal Data Use' ) }
						</VerticalNavItem>
					) }
				</VerticalNav>
			</Main>
		);
	}

	isDataLoading() {
		return ! getSelectedDomain( this.props ) || ! this.props.whois.hasLoadedFromServer;
	}

	goToEdit = () => {
		page( domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	};
}

export default localize( ContactsPrivacy );
