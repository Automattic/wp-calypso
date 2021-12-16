import { Button, Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import {
	domainManagementManageConsent,
	domainManagementEditContactInfo,
} from 'calypso/my-sites/domains/paths';
import {
	enableDomainPrivacy,
	disableDomainPrivacy,
	discloseDomainContactInfo,
	redactDomainContactInfo,
} from 'calypso/state/sites/domains/actions';
import { isUpdatingDomainPrivacy } from 'calypso/state/sites/domains/selectors';
import ContactDisplay from './contact-display';

class ContactsPrivacyCard extends Component {
	static propTypes = {
		privateDomain: PropTypes.bool.isRequired,
		privacyAvailable: PropTypes.bool.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		contactInfoDisclosureAvailable: PropTypes.bool.isRequired,
		contactInfoDisclosed: PropTypes.bool.isRequired,
		isPendingIcannVerification: PropTypes.bool.isRequired,
	};

	togglePrivacy = () => {
		const { selectedSite, privateDomain, selectedDomainName: name } = this.props;

		if ( privateDomain ) {
			this.props.disableDomainPrivacy( selectedSite.ID, name );
		} else {
			this.props.enableDomainPrivacy( selectedSite.ID, name );
		}
	};

	toggleContactInfo = () => {
		const { selectedSite, contactInfoDisclosed, selectedDomainName: name } = this.props;

		if ( contactInfoDisclosed ) {
			this.props.redactDomainContactInfo( selectedSite.ID, name );
		} else {
			this.props.discloseDomainContactInfo( selectedSite.ID, name );
		}
	};

	getPrivacyProtection() {
		const { privateDomain, privacyAvailable } = this.props;
		const { translate, isUpdatingPrivacy } = this.props;

		const label = privateDomain
			? translate( 'Privacy protection on' )
			: translate( 'Privacy protection off' );

		let privacyProtectionNote;
		if ( ! privacyAvailable ) {
			privacyProtectionNote = (
				<p className="contacts-privacy__toggle-item">
					{ translate(
						'Privacy protection is not available due to the registry’s policies. Learn more'
					) }
				</p>
			);
		}

		return (
			<>
				<div className="contacts-privacy__toggle-item">
					<ToggleControl
						checked={ privateDomain }
						disabled={ isUpdatingPrivacy || ! privacyAvailable }
						onChange={ this.togglePrivacy }
						label={ label }
					/>
				</div>
				{ privacyProtectionNote }
			</>
		);
	}

	getContactInfoDisclosed() {
		const {
			contactInfoDisclosed,
			contactInfoDisclosureAvailable,
			isPendingIcannVerification,
			isUpdatingPrivacy,
			privacyAvailable,
			privateDomain,
			translate,
		} = this.props;

		if ( ! privacyAvailable || ! contactInfoDisclosureAvailable || privateDomain ) {
			return false;
		}

		const contactVerificationNotice = isPendingIcannVerification ? (
			<p className="contacts-privacy__toggle-item">
				{ translate(
					'You need to verify the contact information for the domain before you can disclose it publicly.'
				) }
			</p>
		) : null;

		return (
			<>
				<div className="contacts-privacy__toggle-item">
					<ToggleControl
						className="contacts-privacy__toggle-button"
						checked={ contactInfoDisclosed }
						disabled={ isUpdatingPrivacy || isPendingIcannVerification }
						onChange={ this.toggleContactInfo }
						label={ translate( 'Display my contact information in public WHOIS' ) }
					/>
				</div>
				{ contactVerificationNotice }
			</>
		);
	}

	render() {
		const { translate, selectedDomainName, canManageConsent } = this.props;

		return (
			<div>
				<Card className="contacts-privacy__card--redesigned">
					<div className="contacts-privacy__main">
						<ContactDisplay selectedDomainName={ selectedDomainName } />
						<div className="contacts-privacy__button-container">
							<Button
								href={ domainManagementEditContactInfo(
									this.props.selectedSite.slug,
									this.props.selectedDomainName,
									this.props.currentRoute
								) }
							>
								{ translate( 'Edit' ) }
							</Button>
							{ canManageConsent && (
								<Button
									href={ domainManagementManageConsent(
										this.props.selectedSite.slug,
										this.props.selectedDomainName,
										this.props.currentRoute
									) }
								>
									{ translate( 'Manage consent' ) }
								</Button>
							) }
						</div>
					</div>
					<div className="contacts-privacy__toggle-container">
						{ this.getPrivacyProtection() }
						{ this.getContactInfoDisclosed() }
					</div>
				</Card>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		isUpdatingPrivacy: isUpdatingDomainPrivacy(
			state,
			ownProps.selectedSite.ID,
			ownProps.selectedDomainName
		),
	} ),
	{
		enableDomainPrivacy,
		disableDomainPrivacy,
		discloseDomainContactInfo,
		redactDomainContactInfo,
	}
)( localize( ContactsPrivacyCard ) );
