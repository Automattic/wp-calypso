/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import DomainMainPlaceholder from 'my-sites/upgrades/domain-management/components/domain/main-placeholder';
import EditContactInfoFormCard from './form-card';
import EditContactInfoPrivacyEnabledCard from './privacy-enabled-card';
import NonOwnerCard from 'my-sites/upgrades/domain-management/components/domain/non-owner-card';
import Header from 'my-sites/upgrades/domain-management/components/header';
import Main from 'components/main';
import paths from 'my-sites/upgrades/paths';
import { getSelectedDomain } from 'lib/domains';
import SectionHeader from 'components/section-header';

const EditContactInfo = React.createClass( {
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
			return <DomainMainPlaceholder goBack={ this.goToContactsPrivacy } />;
		}

		return (
			<Main className="domain-management-edit-contact-info">
				<Header
					onClick={ this.goToContactsPrivacy }
					selectedDomainName={ this.props.selectedDomainName }>
					{ this.translate( 'Edit Contact Info' ) }
				</Header>
				{ this.getCard() }
			</Main>
		);
	},

	isDataLoading() {
		return ( ! getSelectedDomain( this.props ) || ! this.props.whois.hasLoadedFromServer );
	},

	getCard() {
		const domain = getSelectedDomain( this.props );

		if ( ! domain.currentUserCanManage ) {
			return <NonOwnerCard selectedDomainName={ this.props.selectedDomainName } />;
		}

		if ( ! domain.isWhoisEditable ) {
			return <EditContactInfoPrivacyEnabledCard />;
		}

		return (
			<div>
				<SectionHeader label={ this.translate( 'Edit Contact Info' ) } />
				<EditContactInfoFormCard
					contactInformation={ this.props.whois.data }
					selectedDomainName={ this.props.selectedDomainName }
					selectedSite={ this.props.selectedSite } />
			</div>
		);
	},

	goToContactsPrivacy() {
		page( paths.domainManagementContactsPrivacy( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	}
} );

export default EditContactInfo;
