/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import ContactsPrivacyCard from './card';
import DomainMainPlaceholder from 'my-sites/upgrades/domain-management/components/domain/main-placeholder';
import Header from 'my-sites/upgrades/domain-management/components/header';
import Main from 'components/main';
import VerticalNav from 'components/vertical-nav';
import VerticalNavItem from 'components/vertical-nav/item';
import paths from 'my-sites/upgrades/paths';
import { getSelectedDomain } from 'lib/domains';

const ContactsPrivacy = React.createClass( {
	propTypes: {
		domains: React.PropTypes.object.isRequired,
		whois: React.PropTypes.object.isRequired,
		selectedDomainName: React.PropTypes.string.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired
	},

	render() {
		if ( this.isDataLoading() ) {
			return <DomainMainPlaceholder goBack={ this.goToEdit } />;
		}

		const domain = getSelectedDomain( this.props ),
			{ hasPrivacyProtection, privateDomain, currentUserCanManage } = domain;

		return (
			<Main className="domain-management-contacts-privacy">
				<Header
					onClick={ this.goToEdit }
					selectedDomainName={ this.props.selectedDomainName }>
					{ this.translate( 'Contacts and Privacy' ) }
				</Header>

				<VerticalNav>
					<ContactsPrivacyCard
						contactInformation= { this.props.whois.data }
						selectedDomainName={ this.props.selectedDomainName }
						selectedSite={ this.props.selectedSite }
						hasPrivacyProtection={ hasPrivacyProtection }
						privateDomain={ privateDomain }
						currentUserCanManage={ currentUserCanManage } />

					<VerticalNavItem
							path={ paths.domainManagementEditContactInfo( this.props.selectedSite.slug, this.props.selectedDomainName ) }>
						{ this.translate( 'Edit Contact Info' ) }
					</VerticalNavItem>

					{ ! hasPrivacyProtection && (
						<VerticalNavItem
							path={ paths.domainManagementPrivacyProtection( this.props.selectedSite.slug, this.props.selectedDomainName ) }>
							{ this.translate( 'Privacy Protection' ) }
						</VerticalNavItem>
					) }
				</VerticalNav>
			</Main>
		);
	},

	isDataLoading() {
		return ( ! getSelectedDomain( this.props ) || ! this.props.whois.hasLoadedFromServer );
	},

	goToEdit() {
		page( paths.domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	}
} );

export default ContactsPrivacy;
