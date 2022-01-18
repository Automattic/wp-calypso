import { Button, Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { PRIVACY_PROTECTION, PUBLIC_VS_PRIVATE } from 'calypso/lib/url/support';
import ContactDisplay from 'calypso/my-sites/domains/domain-management/contacts-privacy/contact-display';
import {
	domainManagementEditContactInfo,
	domainManagementManageConsent,
} from 'calypso/my-sites/domains/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import {
	disableDomainPrivacy,
	discloseDomainContactInfo,
	enableDomainPrivacy,
	redactDomainContactInfo,
} from 'calypso/state/sites/domains/actions';
import { isUpdatingDomainPrivacy } from 'calypso/state/sites/domains/selectors';
import type { ContactsCardPassedProps, ContactsCardProps } from './types';

const ContactsPrivacyCard = ( props: ContactsCardProps ): JSX.Element => {
	const translate = useTranslate();
	const togglePrivacy = () => {
		const { selectedSite, privateDomain, selectedDomainName: name } = props;

		if ( privateDomain ) {
			props.disableDomainPrivacy( selectedSite.ID, name );
		} else {
			props.enableDomainPrivacy( selectedSite.ID, name );
		}
	};

	const toggleContactInfo = () => {
		const { selectedSite, contactInfoDisclosed, selectedDomainName: name } = props;

		if ( contactInfoDisclosed ) {
			props.redactDomainContactInfo( selectedSite.ID, name );
		} else {
			props.discloseDomainContactInfo( selectedSite.ID, name );
		}
	};

	const getPrivacyProtection = () => {
		const { privateDomain, privacyAvailable } = props;
		const { isUpdatingPrivacy } = props;

		const label = privateDomain
			? translate( 'Privacy protection on' )
			: translate( 'Privacy protection off' );

		let privacyProtectionNote;
		if ( ! privacyAvailable ) {
			privacyProtectionNote = (
				<p className="contact-information__toggle-item">
					{ translate(
						'Privacy protection is not available due to the registry’s policies. {{a}}Learn more{{/a}}',
						{
							components: {
								a: <a href={ PRIVACY_PROTECTION } target="blank" />,
							},
						}
					) }
				</p>
			);
			if ( privateDomain ) {
				privacyProtectionNote = (
					<p className="contact-information__toggle-item">
						{ translate(
							"Privacy protection must be enabled due to the registry's policies. {{a}}Learn more{{/a}}",
							{
								components: {
									a: <a href={ PRIVACY_PROTECTION } target="blank" />,
								},
							}
						) }
					</p>
				);
			}
		}
		const additionalProps = { disabled: isUpdatingPrivacy || ! privacyAvailable };
		return (
			<>
				<div className="contact-information__toggle-item">
					<ToggleControl
						checked={ privateDomain }
						onChange={ togglePrivacy }
						label={ label }
						{ ...additionalProps }
					/>
				</div>
				{ privacyProtectionNote }
			</>
		);
	};

	const getPrivacyProtectionRecommendationText = () => {
		const { privacyAvailable } = props;
		return privacyAvailable ? (
			<p className="contact-information__toggle-item">
				{ translate( 'We recommend keeping privacy protection on. {{a}}Learn more{{/a}}', {
					components: {
						a: <a href={ PUBLIC_VS_PRIVATE } target="blank" />,
					},
				} ) }
			</p>
		) : null;
	};

	const getContactInfoDisclosed = () => {
		const {
			contactInfoDisclosed,
			contactInfoDisclosureAvailable,
			isPendingIcannVerification,
			isUpdatingPrivacy,
			privacyAvailable,
			privateDomain,
		} = props;

		if ( ! privacyAvailable || ! contactInfoDisclosureAvailable || privateDomain ) {
			return false;
		}

		const contactVerificationNotice = isPendingIcannVerification ? (
			<p className="contact-information__toggle-item">
				{ translate(
					'You need to verify the contact information for the domain before you can disclose it publicly.'
				) }
			</p>
		) : null;

		const additionalProps = { disabled: isUpdatingPrivacy || isPendingIcannVerification };

		return (
			<>
				<div className="contact-information__toggle-item">
					<ToggleControl
						className="contact-information__toggle-button"
						checked={ contactInfoDisclosed }
						onChange={ toggleContactInfo }
						label={ translate( 'Display my contact information in public WHOIS' ) }
						{ ...additionalProps }
					/>
				</div>
				{ contactVerificationNotice }
			</>
		);
	};

	const { selectedDomainName, canManageConsent } = props;

	return (
		<div>
			<Card className="contact-information__card">
				<div className="contact-information__main">
					<ContactDisplay selectedDomainName={ selectedDomainName } />
					<div className="contact-information__button-container">
						<Button
							href={ domainManagementEditContactInfo(
								props.selectedSite.slug,
								props.selectedDomainName,
								props.currentRoute as undefined
							) }
						>
							{ translate( 'Edit' ) }
						</Button>
						{ canManageConsent && (
							<Button
								href={ domainManagementManageConsent(
									props.selectedSite.slug,
									props.selectedDomainName,
									props.currentRoute as undefined
								) }
							>
								{ translate( 'Manage consent' ) }
							</Button>
						) }
					</div>
				</div>
				<div className="contact-information__toggle-container">
					{ getPrivacyProtection() }
					{ getContactInfoDisclosed() }
					{ getPrivacyProtectionRecommendationText() }
				</div>
			</Card>
		</div>
	);
};

export default connect(
	( state, ownProps: ContactsCardPassedProps ) => ( {
		currentRoute: getCurrentRoute( state ),
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
)( ContactsPrivacyCard );
