/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
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
import isRequestingWhois from 'state/selectors/is-requesting-whois';

/**
 * Style dependencies
 */
import './style.scss';

class ContactsPrivacy extends React.PureComponent {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	render() {
		if ( this.isDataLoading() ) {
			return <DomainMainPlaceholder goBack={ this.goToEdit } />;
		}

		const { translate } = this.props;
		const domain = getSelectedDomain( this.props );
		const {
			privateDomain,
			privacyAvailable,
			contactInfoDisclosed,
			contactInfoDisclosureAvailable,
			isPendingIcannVerification,
		} = domain;

		const canManageConsent =
			config.isEnabled( 'domains/gdpr-consent-page' ) && domain.supportsGdprConsentManagement;

		return (
			<Main className="contacts-privacy">
				<Header onClick={ this.goToEdit } selectedDomainName={ this.props.selectedDomainName }>
					{ translate( 'Contacts and Privacy' ) }
				</Header>

				<VerticalNav>
					<ContactsPrivacyCard
						selectedDomainName={ this.props.selectedDomainName }
						selectedSite={ this.props.selectedSite }
						privateDomain={ privateDomain }
						privacyAvailable={ privacyAvailable }
						contactInfoDisclosed={ contactInfoDisclosed }
						contactInfoDisclosureAvailable={ contactInfoDisclosureAvailable }
						isPendingIcannVerification={ isPendingIcannVerification }
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
		return ! getSelectedDomain( this.props ) || this.props.isRequestingWhois;
	}

	goToEdit = () => {
		page( domainManagementEdit( this.props.selectedSite.slug, this.props.selectedDomainName ) );
	};
}

export default connect( ( state, ownProps ) => {
	return {
		isRequestingWhois: isRequestingWhois( state, ownProps.selectedDomainName ),
	};
} )( localize( ContactsPrivacy ) );
