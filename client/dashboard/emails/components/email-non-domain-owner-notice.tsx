import { Domain } from '@automattic/api-core';
import { Notice } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';

const CALYPSO_CONTACT = '/help/contact';

type EmailNonDomainOwnerMessageProps = {
	domain?: Domain;
};

export const EmailNonDomainOwnerNotice = ( props: EmailNonDomainOwnerMessageProps ) => {
	const { domain } = props;

	const ownerUserName = domain?.owner;

	const isPrivacyAvailable = domain?.privacy_available;

	const contactOwnerUrl = addQueryArgs( 'https://privatewho.is/', {
		s: domain?.domain || '',
	} );

	const loginUrl = addQueryArgs( '/log-in/', {
		redirect_to: window.location.pathname,
	} );

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
