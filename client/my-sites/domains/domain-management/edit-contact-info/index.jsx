/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import EditContactInfoFormCard from './form-card';
import EditContactInfoPrivacyEnabledCard from './privacy-enabled-card';
import PendingWhoisUpdateCard from './pending-whois-update-card';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import Main from 'calypso/components/main';
import { domainManagementContactsPrivacy } from 'calypso/my-sites/domains/paths';
import { getSelectedDomain } from 'calypso/lib/domains';
import isRequestingWhois from 'calypso/state/selectors/is-requesting-whois';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';

class EditContactInfo extends React.Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	render() {
		if ( this.isDataLoading() ) {
			return <DomainMainPlaceholder goBack={ this.goToContactsPrivacy } />;
		}

		return (
			<Main className="edit-contact-info">
				<Header
					onClick={ this.goToContactsPrivacy }
					selectedDomainName={ this.props.selectedDomainName }
				>
					{ this.props.translate( 'Edit Contact Info' ) }
				</Header>
				{ this.getCard() }
			</Main>
		);
	}

	isDataLoading = () => {
		return ! getSelectedDomain( this.props ) || this.props.isRequestingWhois;
	};

	getCard = () => {
		const domain = getSelectedDomain( this.props );

		if ( ! domain.currentUserCanManage ) {
			return <NonOwnerCard { ...this.props } />;
		}

		if ( domain.isPendingWhoisUpdate ) {
			return <PendingWhoisUpdateCard />;
		}

		if ( domain.mustRemovePrivacyBeforeContactUpdate && domain.privateDomain ) {
			return (
				<EditContactInfoPrivacyEnabledCard
					selectedDomainName={ this.props.selectedDomainName }
					selectedSiteSlug={ this.props.selectedSite.slug }
				/>
			);
		}

		return (
			<div>
				<EditContactInfoFormCard
					domainRegistrationAgreementUrl={ domain.domainRegistrationAgreementUrl }
					selectedDomain={ getSelectedDomain( this.props ) }
					selectedSite={ this.props.selectedSite }
					showContactInfoNote={ true }
				/>
			</div>
		);
	};

	goToContactsPrivacy = () => {
		page(
			domainManagementContactsPrivacy(
				this.props.selectedSite.slug,
				this.props.selectedDomainName,
				this.props.currentRoute
			)
		);
	};
}

export default connect( ( state, ownProps ) => {
	return {
		currentRoute: getCurrentRoute( state ),
		isRequestingWhois: isRequestingWhois( state, ownProps.selectedDomainName ),
	};
} )( localize( EditContactInfo ) );
