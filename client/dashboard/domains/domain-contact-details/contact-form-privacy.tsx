import {
	domainPrivacyDisableMutation,
	domainPrivacyEnableMutation,
	domainQuery,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ToggleControl,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';
import { SectionHeader } from '../../components/section-header';

interface ContactFormPrivacyProps {
	domainName: string;
}

export default function ContactFormPrivacy( { domainName }: ContactFormPrivacyProps ) {
	const { data: domain, isFetching: domainQueryIsFetching } = useSuspenseQuery(
		domainQuery( domainName )
	);
	const enablePrivacyMutation = useMutation( domainPrivacyEnableMutation( domainName ) );
	const disablePrivacyMutation = useMutation( domainPrivacyDisableMutation( domainName ) );
	const isUpdatingPrivacy =
		enablePrivacyMutation.isPending || disablePrivacyMutation.isPending || domainQueryIsFetching;

	const togglePrivacy = () => {
		if ( domain.private_domain ) {
			disablePrivacyMutation.mutate( undefined, {
				onSuccess: () => {},
			} );
		} else {
			enablePrivacyMutation.mutate();
		}
	};

	const renderPrivacyProtection = () => {
		let note;

		if ( ! domain.privacy_available ) {
			note = createInterpolateElement(
				__(
					'Privacy protection is not available due to the registry’s policies. <link>Learn more</link>'
				),
				{
					link: <InlineSupportLink supportContext="domain-registrations-and-privacy" />,
				}
			);

			if ( domain.private_domain ) {
				note = createInterpolateElement(
					__(
						'Privacy protection must be enabled due to the registry’s policies. <link>Learn more</link>'
					),
					{
						link: <InlineSupportLink supportContext="domain-registrations-and-privacy" />,
					}
				);
			}
		}

		return (
			<>
				<ToggleControl
					__nextHasNoMarginBottom
					checked={ domain.private_domain }
					disabled={ isUpdatingPrivacy || ! domain.privacy_available }
					onChange={ togglePrivacy }
					label={ __( 'Privacy protection' ) }
				/>

				{ note && (
					<Text as="p" variant="muted">
						{ note }
					</Text>
				) }
			</>
		);
	};

	const renderContactDisclosure = () => {
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
					onChange={ () => {} }
					disabled={ isUpdatingPrivacy || domain.is_pending_icann_verification }
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
			<SectionHeader title={ __( 'Privacy protection' ) } level={ 3 } />

			{ renderPrivacyProtection() }
			{ renderContactDisclosure() }

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
