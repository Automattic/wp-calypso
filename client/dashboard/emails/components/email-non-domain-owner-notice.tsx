import { Domain, Site } from '@automattic/api-core';
import { Notice } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import {
	buildQueryString,
	getEmailManagementPath,
	getPurchaseNewEmailAccountPath,
} from '../../utils/email-paths';

const CALYPSO_CONTACT = '/help/contact';

type EmailNonDomainOwnerMessageProps = {
	domain?: Domain;
	selectedSite?: Site | null;
	source: 'email-comparison' | 'email-management';
};

export const EmailNonDomainOwnerNotice = ( props: EmailNonDomainOwnerMessageProps ) => {
	const { domain, selectedSite, source } = props;

	const ownerUserName = domain?.owner;

	const isPrivacyAvailable = domain?.privacy_available;
	const buildLoginUrl = () => {
		const redirectUrlParameter =
			source === 'email-comparison'
				? getPurchaseNewEmailAccountPath( selectedSite?.slug, domain?.domain, '', 'login-redirect' )
				: getEmailManagementPath( selectedSite?.slug, domain?.domain );

		return `/log-in/${ buildQueryString( {
			email_address: ownerUserName,
			redirect_to: redirectUrlParameter,
		} ) }`;
	};

	const contactOwnerUrl = `https://privatewho.is/${ buildQueryString( {
		s: domain?.domain || '',
	} ) }`;

	const loginUrl = buildLoginUrl();

	const placeholders = {
		ownerUserName,
		selectedDomainName: domain?.domain ?? '',
	};
	const elements = {
		contactSupportLink: <a href={ CALYPSO_CONTACT } rel="noopener noreferrer" target="_blank" />,
		loginLink: <a href={ loginUrl } rel="external" />,
		reachOutLink: isPrivacyAvailable ? (
			<a href={ contactOwnerUrl } rel="noopener noreferrer" target="_blank" />
		) : (
			<></>
		),
		strong: <strong />,
	};

	let reasonText;

	if ( ownerUserName ) {
		reasonText = createInterpolateElement(
			sprintf(
				// Translators: %(ownerUserName)s is the user name of the owner of the domain, %(selectedDomainName)s is the domain name.
				__(
					'Email service can only be purchased by <strong>%(ownerUserName)s</strong>, ' +
						'who is the owner of <strong>%(selectedDomainName)s</strong>. ' +
						'If you have access to that account, please <loginLink>log in with the account</loginLink> to make a purchase. ' +
						'Otherwise, please <reachOutLink>reach out to %(ownerUserName)s</reachOutLink> or <contactSupportLink>contact support</contactSupportLink>.'
				),
				placeholders
			),
			elements
		);
	} else {
		reasonText = createInterpolateElement(
			sprintf(
				// Translators: %(selectedDomainName)s is the domain name.
				__(
					'Email service can only be purchased by the owner of <strong>%(selectedDomainName)s</strong>. ' +
						'If you have access to that account, please log in with the account to make a purchase. ' +
						'Otherwise, please <contactSupportLink>contact support</contactSupportLink>.'
				),
				placeholders
			),
			elements
		);
	}

	return (
		<Notice status="warning" isDismissible={ false }>
			{ reasonText }
		</Notice>
	);
};
