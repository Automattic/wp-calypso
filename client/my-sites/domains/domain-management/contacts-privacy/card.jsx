/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { CompactCard, Gridicon } from '@automattic/components';
import ContactDisplay from './contact-display';
import SectionHeader from 'components/section-header';
import { PUBLIC_VS_PRIVATE } from 'lib/url/support';
import FormToggle from 'components/forms/form-toggle';
import {
	enableDomainPrivacy,
	disableDomainPrivacy,
	discloseDomainContactInfo,
	redactDomainContactInfo,
} from 'state/sites/domains/actions';
import { isUpdatingDomainPrivacy } from 'state/sites/domains/selectors';

class ContactsPrivacyCard extends React.Component {
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

		let privacyProtectionNote;
		if ( ! privacyAvailable ) {
			privacyProtectionNote = (
				<div className="contacts-privacy__settings warning">
					<Gridicon icon="info-outline" size={ 18 } />
					<p>{ translate( 'Privacy settings can not be changed for this domain' ) }</p>
				</div>
			);
		}

		return (
			<React.Fragment>
				<div className="contacts-privacy__settings">
					<FormToggle
						wrapperClassName="edit__privacy-protection-toggle"
						checked={ privateDomain }
						toggling={ isUpdatingPrivacy }
						disabled={ isUpdatingPrivacy || ! privacyAvailable }
						onChange={ this.togglePrivacy }
					>
						{ translate( 'Privacy Protection' ) }
					</FormToggle>
				</div>
				{ privacyProtectionNote }
			</React.Fragment>
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
			<div class="contacts-privacy__settings warning">
				<Gridicon icon="info-outline" size={ 18 } />
				<p>
					{ translate(
						'You need to verify the contact information for the domain before you can disclose it publicly.'
					) }
				</p>
			</div>
		) : null;

		return (
			<React.Fragment>
				<div className="contacts-privacy__settings">
					<FormToggle
						wrapperClassName="edit__disclose-contact-information"
						checked={ contactInfoDisclosed }
						toggling={ isUpdatingPrivacy }
						disabled={ isUpdatingPrivacy || isPendingIcannVerification }
						onChange={ this.toggleContactInfo }
					>
						{ translate( 'Display my contact information in public WHOIS' ) }
					</FormToggle>
				</div>
				{ contactVerificationNotice }
			</React.Fragment>
		);
	}

	render() {
		const { translate, selectedDomainName } = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Domain Contacts' ) } />

				<CompactCard className="contacts-privacy__card">
					{ this.getPrivacyProtection() }

					{ this.getContactInfoDisclosed() }

					<ContactDisplay selectedDomainName={ selectedDomainName } />

					<p className="contacts-privacy__settings-explanation">
						{ translate(
							'Domain owners are required to provide correct contact information. ' +
								'{{a}}Learn more{{/a}} about private registration and GDPR protection.',
							{
								components: {
									a: <a href={ PUBLIC_VS_PRIVATE } target="_blank" rel="noopener noreferrer" />,
								},
							}
						) }
					</p>
				</CompactCard>
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
