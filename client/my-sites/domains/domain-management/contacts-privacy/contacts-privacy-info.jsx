import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import { getSelectedDomain } from 'calypso/lib/domains';
import NonOwnerCard from 'calypso/my-sites/domains/domain-management/components/domain/non-owner-card';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isRequestingWhois from 'calypso/state/selectors/is-requesting-whois';
import ContactsPrivacyCard from './contacts-card';

import './style.scss';

class ContactsPrivacy extends PureComponent {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	renderForOwner() {
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
			<ContactsPrivacyCard
				selectedDomainName={ this.props.selectedDomainName }
				selectedSite={ this.props.selectedSite }
				canManageConsent={ canManageConsent }
				privateDomain={ privateDomain }
				privacyAvailable={ privacyAvailable }
				contactInfoDisclosed={ contactInfoDisclosed }
				contactInfoDisclosureAvailable={ contactInfoDisclosureAvailable }
				isPendingIcannVerification={ isPendingIcannVerification }
			/>
		);
	}

	renderForOthers() {
		const { domains, selectedDomainName } = this.props;
		return <NonOwnerCard domains={ domains } selectedDomainName={ selectedDomainName } />;
	}

	render() {
		const domain = getSelectedDomain( this.props );
		return domain.currentUserCanManage ? this.renderForOwner() : this.renderForOthers();
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
