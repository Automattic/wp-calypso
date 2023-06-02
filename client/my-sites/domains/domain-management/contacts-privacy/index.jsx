import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import Main from 'calypso/components/main';
import VerticalNav from 'calypso/components/vertical-nav';
import VerticalNavItem from 'calypso/components/vertical-nav/item';
import { getSelectedDomain } from 'calypso/lib/domains';
import DomainMainPlaceholder from 'calypso/my-sites/domains/domain-management/components/domain/main-placeholder';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import Header from 'calypso/my-sites/domains/domain-management/components/header';
import {
	domainManagementEdit,
	domainManagementEditContactInfo,
	domainManagementManageConsent,
} from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isRequestingWhois from 'calypso/state/selectors/is-requesting-whois';
import ContactsPrivacyCard from './card';

import './style.scss';

class ContactsPrivacy extends PureComponent {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	renderForOwner() {
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
			<>
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
						this.props.selectedDomainName,
						this.props.currentRoute
					) }
				>
					{ translate( 'Edit contact info' ) }
				</VerticalNavItem>

				{ canManageConsent && (
					<VerticalNavItem
						path={ domainManagementManageConsent(
							this.props.selectedSite.slug,
							this.props.selectedDomainName,
							this.props.currentRoute
						) }
					>
						{ translate( 'Manage Consent for Personal Data Use' ) }
					</VerticalNavItem>
				) }
			</>
		);
	}

	renderForOthers() {
		const { domains, selectedDomainName } = this.props;
		return <NonOwnerCard domains={ domains } selectedDomainName={ selectedDomainName } />;
	}

	render() {
		if ( this.isDataLoading() ) {
			return <DomainMainPlaceholder goBack={ this.goToEdit } />;
		}

		const { translate } = this.props;
		const domain = getSelectedDomain( this.props );

		return (
			<Main className="contacts-privacy">
				<Header onClick={ this.goToEdit } selectedDomainName={ this.props.selectedDomainName }>
					{ translate( 'Contacts and Privacy' ) }
				</Header>

				<VerticalNav>
					{ domain.currentUserCanManage ? this.renderForOwner() : this.renderForOthers() }
				</VerticalNav>
			</Main>
		);
	}

	isDataLoading() {
		return ! getSelectedDomain( this.props ) || this.props.isRequestingWhois;
	}

	goToEdit = () => {
		page(
			domainManagementEdit(
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
} )( localize( ContactsPrivacy ) );
