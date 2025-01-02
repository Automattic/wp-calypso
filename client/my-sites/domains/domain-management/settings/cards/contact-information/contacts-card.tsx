import { Button, Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { PRIVACY_PROTECTION, PUBLIC_VS_PRIVATE } from '@automattic/urls';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import useDomainTransferRequestQuery from 'calypso/data/domains/transfers/use-domain-transfer-request-query';
import {
	domainManagementAllEditContactInfo,
	domainManagementEditContactInfo,
	domainManagementManageConsent,
	isUnderDomainManagementOverview,
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
	const pendingContactUpdate = props.hasPendingContactUpdate;

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
			isHundredYearDomain,
		} = props;

		if (
			! privacyAvailable ||
			! contactInfoDisclosureAvailable ||
			privateDomain ||
			isHundredYearDomain
		) {
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

	const renderTrusteeNotice = () => {
		return (
			<Notice
				text={ translate(
					'Your domain is using a trustee service. The information displayed in public Whois database may differ from that displayed below.'
				) }
				icon="info"
				showDismiss={ false }
				status="is-warning"
			>
				<NoticeAction external href={ props.registeredViaTrusteeUrl }>
					{ translate( 'More info' ) }
				</NoticeAction>
			</Notice>
		);
	};

	const { selectedDomainName, canManageConsent, currentRoute, readOnly, isHundredYearDomain } =
		props;
	const editContactInfoLink = isUnderDomainManagementOverview( currentRoute )
		? domainManagementAllEditContactInfo( props.selectedSite.slug, props.selectedDomainName )
		: domainManagementEditContactInfo(
				props.selectedSite.slug,
				props.selectedDomainName,
				currentRoute
		  );

	return (
		<div>
			<Card className="contact-information__card">
				<div className="contact-information__main">
					{ props.registeredViaTrustee && renderTrusteeNotice() }
					<ContactDisplay selectedDomainName={ selectedDomainName } />
					<div className="contact-information__button-container">
						{ ! isHundredYearDomain && (
							<Button
								disabled={ disableEdit || readOnly || pendingContactUpdate }
								href={ disableEdit || readOnly || pendingContactUpdate ? '' : editContactInfoLink }
							>
								{ translate( 'Edit' ) }
							</Button>
						) }

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
					{ disableEdit && ! readOnly && (
						<p className="contact-information__transfer-warn">
							{ translate(
								'Contact modifications are disabled while domain transfers are pending.'
							) }
						</p>
					) }
					{ pendingContactUpdate && (
						<p className="contact-information__pending-update-warn">
							{ translate(
								"This domain has a pending contact information update. You will be able to update your contact information once the pending update is complete. If you don't confirm the update, the pending request will be canceled after 5 days."
							) }
						</p>
					) }
				</div>
				{ ! isHundredYearDomain && (
					<div className="contact-information__toggle-container">
						{ getPrivacyProtection() }
						{ getContactInfoDisclosed() }
						{ getPrivacyProtectionRecommendationText() }
					</div>
				) }
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
