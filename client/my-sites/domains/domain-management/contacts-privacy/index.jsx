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
import ContactsPrivacyCard from './card';
import DomainMainPlaceholder from 'client/my-sites/domains/domain-management/components/domain/main-placeholder';
import Header from 'client/my-sites/domains/domain-management/components/header';
import Main from 'client/components/main';
import VerticalNav from 'client/components/vertical-nav';
import VerticalNavItem from 'client/components/vertical-nav/item';
import paths from 'client/my-sites/domains/paths';
import { getSelectedDomain } from 'client/lib/domains';
import { findRegistrantWhois, findPrivacyServiceWhois } from 'client/lib/domains/whois/utils';

class ContactsPrivacy extends React.PureComponent {
	static propTypes = {
		domains: PropTypes.object.isRequired,
		whois: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	render() {
		if ( this.isDataLoading() ) {
			return <DomainMainPlaceholder goBack={ this.goToEdit } />;
		}

		const { translate } = this.props;
		const domain = getSelectedDomain( this.props );
		const { hasPrivacyProtection, privateDomain, privacyAvailable, currentUserCanManage } = domain;
		const contactInformation = privateDomain
			? findPrivacyServiceWhois( this.props.whois.data )
			: findRegistrantWhois( this.props.whois.data );

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
						path={ paths.domainManagementEditContactInfo(
							this.props.selectedSite.slug,
							this.props.selectedDomainName
						) }
					>
						{ translate( 'Edit Contact Info' ) }
					</VerticalNavItem>

					{ ! hasPrivacyProtection &&
						privacyAvailable && (
							<VerticalNavItem
								path={ paths.domainManagementPrivacyProtection(
									this.props.selectedSite.slug,
									this.props.selectedDomainName
								) }
							>
								{ translate( 'Privacy Protection' ) }
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
		page(
			paths.domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName )
		);
	};
}

export default localize( ContactsPrivacy );
