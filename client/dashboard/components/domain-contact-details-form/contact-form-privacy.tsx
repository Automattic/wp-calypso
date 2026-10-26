import { domainQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ToggleControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../inline-support-link';

interface ContactFormPrivacyProps {
	domainName: string;
	isSubmitting: boolean;
	onTogglePrivacyProtection: () => void;
	onTogglePrivacyDisclosure: () => void;
}

export default function ContactFormPrivacy( {
	domainName,
	isSubmitting,
	onTogglePrivacyProtection,
	onTogglePrivacyDisclosure,
}: ContactFormPrivacyProps ) {
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );

	const getPrivacyProtectionHelp = () => {
		if ( ! domain.privacy_available ) {
			return domain.private_domain
				? __(
						'Privacy protection must be enabled due to the registry’s policies. <learnMoreLink />'
					)
				: __(
						'Privacy protection is not available due to the registry’s policies. <learnMoreLink />'
					);
		}

		return domain.private_domain
			? __(
					'Your name, address, email and phone stay private. Anyone who looks the domain up in the public WHOIS record sees the registrar’s details instead. <learnMoreLink />'
				)
			: __(
					'Your name, address, email and phone are public. Anyone who looks the domain up in the WHOIS record sees them. Turn on to keep them private. <learnMoreLink />'
				);
	};

	const renderPrivacyProtection = () => {
		return (
			<ToggleControl
				__nextHasNoMarginBottom
				checked={ domain.private_domain }
				disabled={ isSubmitting || ! domain.privacy_available }
				onChange={ onTogglePrivacyProtection }
				label={
					domain.private_domain ? __( 'Privacy protection on' ) : __( 'Privacy protection off' )
				}
				help={ createInterpolateElement( getPrivacyProtectionHelp(), {
					learnMoreLink: <InlineSupportLink supportContext="domain-registrations-and-privacy" />,
				} ) }
			/>
		);
	};

	const renderPrivacyDisclosure = () => {
		if (
			! domain.privacy_available ||
			! domain.contact_info_disclosure_available ||
			domain.private_domain ||
			domain.is_hundred_year_domain
		) {
			return false;
		}

		return (
			<>
				<ToggleControl
					__nextHasNoMarginBottom
					checked={ domain.contact_info_disclosed }
					onChange={ onTogglePrivacyDisclosure }
					disabled={ isSubmitting || domain.is_pending_icann_verification }
					label={ __( 'Display my contact information in public WHOIS' ) }
				/>

				{ domain.is_pending_icann_verification && (
					<Text as="p" variant="muted">
						{ __(
							'You need to verify the contact information for the domain before you can disclose it publicly.'
						) }
					</Text>
				) }
			</>
		);
	};

	return (
		<VStack spacing={ 4 }>
			{ renderPrivacyProtection() }
			{ renderPrivacyDisclosure() }
		</VStack>
	);
}
