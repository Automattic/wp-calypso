import { Button, Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import useDomainTransferRequestQuery from 'calypso/data/domains/transfers/use-domain-transfer-request-query';
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
import { IAppState } from 'calypso/state/types';
import ContactDisplay from './contact-display';
import type { ContactsCardPassedProps, ContactsCardProps } from './types';

const ContactsPrivacyCard = ( props: ContactsCardProps ) => {
	const translate = useTranslate();

	const { data, isLoading } = useDomainTransferRequestQuery(
		props.selectedSite.slug,
		props.selectedDomainName
	);
	const disableEdit = !! ( isLoading || data?.email );

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
								a: <a href={ localizeUrl( PRIVACY_PROTECTION ) } target="blank" />,
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
									a: <a href={ localizeUrl( PRIVACY_PROTECTION ) } target="blank" />,
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
						a: <a href={ localizeUrl( PUBLIC_VS_PRIVATE ) } target="blank" />,
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

	const { selectedDomainName, canManageConsent, currentRoute } = props;

	return (
		<div>
			<Card className="contact-information__card">
				<div className="contact-information__main">
					<ContactDisplay selectedDomainName={ selectedDomainName } />
					<div className="contact-information__button-container">
						<Button
							disabled={ disableEdit }
							href={
								disableEdit
									? ''
									: domainManagementEditContactInfo(
											props.selectedSite.slug,
											props.selectedDomainName,
											currentRoute
									  )
							}
						>
							{ translate( 'Edit' ) }
						</Button>

						{ canManageConsent && (
							<Button
								href={ domainManagementManageConsent(
									props.selectedSite.slug,
									props.selectedDomainName,
									currentRoute
								) }
							>
								{ translate( 'Manage consent' ) }
							</Button>
						) }
					</div>
					{ disableEdit && (
						<p className="contact-information__transfer-warn">
							{ translate(
								'Contact modifications are disabled while domain transfers are pending.'
							) }
						</p>
					) }
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
	( state: IAppState, ownProps: ContactsCardPassedProps ) => ( {
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
