import { Card, Gridicon } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { PUBLIC_VS_PRIVATE } from 'calypso/lib/url/support';
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
			<Fragment>
				<div className="contacts-privacy__settings">
					<ToggleControl
						checked={ privateDomain }
						disabled={ isUpdatingPrivacy || ! privacyAvailable }
						onChange={ this.togglePrivacy }
						label={ translate( 'Privacy Protection' ) }
					/>
				</div>
				{ privacyProtectionNote }
			</Fragment>
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
			<div className="contacts-privacy__settings warning">
				<Gridicon icon="info-outline" size={ 18 } />
				<p>
					{ translate(
						'You need to verify the contact information for the domain before you can disclose it publicly.'
					) }
				</p>
			</div>
		) : null;

		return (
			<Fragment>
				<div className="contacts-privacy__settings">
					<ToggleControl
						checked={ contactInfoDisclosed }
						disabled={ isUpdatingPrivacy || isPendingIcannVerification }
						onChange={ this.toggleContactInfo }
						label={ translate( 'Display my contact information in public WHOIS' ) }
					/>
				</div>
				{ contactVerificationNotice }
			</Fragment>
		);
	}

	render() {
		const { translate, selectedDomainName } = this.props;

		return (
			<div>
				<Card className="contacts-privacy__card">
					<p>{ translate( 'Your domain contact information' ) }</p>

					<ContactDisplay selectedDomainName={ selectedDomainName } />

					{ this.getPrivacyProtection() }

					{ this.getContactInfoDisclosed() }

					<p className="contacts-privacy__settings-explanation">
						{ translate( '{{a}}Learn more{{/a}} about private registration and GDPR protection.', {
							components: {
								a: <a href={ PUBLIC_VS_PRIVATE } target="_blank" rel="noopener noreferrer" />,
							},
						} ) }
					</p>
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
