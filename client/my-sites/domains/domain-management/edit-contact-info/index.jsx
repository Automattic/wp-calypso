/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import page from 'page';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import DomainMainPlaceholder from 'my-sites/domains/domain-management/components/domain/main-placeholder';
import EditContactInfoFormCard from './form-card';
import EditContactInfoPrivacyEnabledCard from './privacy-enabled-card';
import PendingWhoisUpdateCard from './pending-whois-update-card';
import NonOwnerCard from 'my-sites/domains/domain-management/components/domain/non-owner-card';
import Header from 'my-sites/domains/domain-management/components/header';
import Main from 'components/main';
import paths from 'my-sites/domains/paths';
import { getSelectedDomain } from 'lib/domains';
import { findRegistrantWhois } from 'lib/domains/whois/utils';
import SectionHeader from 'components/section-header';
import { registrar as registrarNames } from 'lib/domains/constants';

const EditContactInfo = React.createClass( {
	propTypes: {
		domains: PropTypes.object.isRequired,
		whois: PropTypes.object.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
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
		const domain = getSelectedDomain( this.props ),
			{ OPENHRS, OPENSRS } = registrarNames;

		if ( ! domain.currentUserCanManage ) {
			return <NonOwnerCard { ...this.props } />;
		}

		if ( domain.isPendingWhoisUpdate ) {
			return <PendingWhoisUpdateCard />;
		}

		if ( ! includes( [ OPENHRS, OPENSRS ], domain.registrar ) && domain.privateDomain ) {
			return <EditContactInfoPrivacyEnabledCard />;
		}

		return (
			<div>
				<SectionHeader label={ this.translate( 'Edit Contact Info' ) } />
				<EditContactInfoFormCard
					contactInformation={ findRegistrantWhois( this.props.whois.data ) }
					selectedDomain={ getSelectedDomain( this.props ) }
					selectedSite={ this.props.selectedSite } />
			</div>
		);
	},

	goToContactsPrivacy() {
		page( paths.domainManagementContactsPrivacy( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	}
} );

export default EditContactInfo;
