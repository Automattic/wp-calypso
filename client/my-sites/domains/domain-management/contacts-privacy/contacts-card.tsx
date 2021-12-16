import { Button, Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import { PRIVACY_PROTECTION, PUBLIC_VS_PRIVATE } from 'calypso/lib/url/support';
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
import ContactDisplay from './contact-display';
import type { ContactsPrivacyCardPassedProps, ContactsPrivacyCardProps } from './types';

const ContactsPrivacyCard = ( props: ContactsPrivacyCardProps ): JSX.Element => {
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
				<p className="contacts-privacy__toggle-item">
					{ translate(
						'Privacy protection is not available due to the registry’s policies. {{a}}Learn more{{/a}}',
						{
							components: {
								a: <a href={ PRIVACY_PROTECTION } />,
							},
						}
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
						onChange={ togglePrivacy }
						label={ label }
					/>
				</div>
				{ privacyProtectionNote }
			</>
		);
	};

	const getPrivacyProtectionRecommendationText = () => {
		return (
			<p className="contacts-privacy__toggle-item">
				{ translate( 'We recommend keeping privacy protection on. {{a}}Learn more{{/a}}', {
					components: {
						a: <a href={ PUBLIC_VS_PRIVATE } />,
					},
				} ) }
			</p>
		);
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
						onChange={ toggleContactInfo }
						label={ translate( 'Display my contact information in public WHOIS' ) }
					/>
				</div>
				{ contactVerificationNotice }
			</>
		);
	};

	const { selectedDomainName, canManageConsent } = props;

	return (
		<div>
			<Card className="contacts-privacy__card--redesigned">
				<div className="contacts-privacy__main">
					<ContactDisplay selectedDomainName={ selectedDomainName } />
					<div className="contacts-privacy__button-container">
						<Button
							href={ domainManagementEditContactInfo(
								props.selectedSite.slug,
								props.selectedDomainName,
								props.currentRoute
							) }
						>
							{ translate( 'Edit' ) }
						</Button>
						{ canManageConsent && (
							<Button
								href={ domainManagementManageConsent(
									props.selectedSite.slug,
									props.selectedDomainName,
									props.currentRoute
								) }
							>
								{ translate( 'Manage consent' ) }
							</Button>
						) }
					</div>
				</div>
				<div className="contacts-privacy__toggle-container">
					{ getPrivacyProtection() }
					{ getContactInfoDisclosed() }
					{ getPrivacyProtectionRecommendationText() }
				</div>
			</Card>
		</div>
	);
};

export default connect(
	( state, ownProps: ContactsPrivacyCardPassedProps ) => ( {
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
