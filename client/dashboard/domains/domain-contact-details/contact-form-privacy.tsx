import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ToggleControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';
import { SectionHeader } from '../../components/section-header';
import type { Domain } from '@automattic/api-core';

interface ContactFormPrivacyProps {
	domain: Domain;
}

export default function ContactFormPrivacy( { domain }: ContactFormPrivacyProps ) {
	const renderPrivacyProtection = () => {
		return (
			<ToggleControl
				checked={ domain.private_domain }
				disabled={ ! domain.privacy_available }
				onChange={ () => {} }
				label={ __( 'Privacy protection' ) }
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
			<ToggleControl
				checked={ domain.contact_info_disclosed }
				onChange={ () => {} }
				disabled={ domain.is_pending_icann_verification }
				label={ __( 'Display my contact information in public WHOIS' ) }
			/>
		);
	};

	return (
		<VStack spacing={ 4 }>
			<SectionHeader title={ __( 'Privacy protection' ) } level={ 3 } />

			<VStack spacing={ 2 }>
				{ renderPrivacyProtection() }
				{ renderPrivacyDisclosure() }
			</VStack>

			{ domain.privacy_available && (
				<Text as="p" variant="muted">
					{ createInterpolateElement(
						__( 'We recommend keeping privacy protection on. <link>Learn more</link>' ),
						{
							link: <InlineSupportLink supportContext="domain-registrations-and-privacy" />,
						}
					) }
				</Text>
			) }
		</VStack>
	);
}
