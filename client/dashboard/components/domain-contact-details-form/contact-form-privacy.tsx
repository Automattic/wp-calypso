import {
	domainPrivacyDisableMutation,
	domainPrivacyDiscloseMutation,
	domainPrivacyEnableMutation,
	domainPrivacyRedactMutation,
	domainQuery,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	ToggleControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import InlineSupportLink from '../inline-support-link';
import { SectionHeader } from '../section-header';

interface ContactFormPrivacyProps {
	domainName: string;
}

export default function ContactFormPrivacy( { domainName }: ContactFormPrivacyProps ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: domain, isFetching: domainQueryIsFetching } = useSuspenseQuery(
		domainQuery( domainName )
	);
	const enablePrivacyMutation = useMutation( domainPrivacyEnableMutation( domainName ) );
	const disablePrivacyMutation = useMutation( domainPrivacyDisableMutation( domainName ) );
	const disclosePrivacyMutation = useMutation( domainPrivacyDiscloseMutation( domainName ) );
	const redactPrivacyMutation = useMutation( domainPrivacyRedactMutation( domainName ) );
	const isUpdatingPrivacy =
		enablePrivacyMutation.isPending ||
		disablePrivacyMutation.isPending ||
		disclosePrivacyMutation.isPending ||
		redactPrivacyMutation.isPending ||
		domainQueryIsFetching;

	const togglePrivacyProtection = () => {
		if ( domain.private_domain ) {
			disablePrivacyMutation.mutate( undefined, {
				onSuccess: () => {
					createSuccessNotice( __( 'Privacy has been successfully disabled!' ), {
						type: 'snackbar',
					} );
				},
				onError: ( error: Error ) => {
					createErrorNotice( error.message, {
						type: 'snackbar',
					} );
				},
			} );
		} else {
			enablePrivacyMutation.mutate( undefined, {
				onSuccess: () => {
					createSuccessNotice( __( 'Privacy has been successfully enabled!' ), {
						type: 'snackbar',
					} );
				},
				onError: ( error: Error ) => {
					createErrorNotice( error.message, {
						type: 'snackbar',
					} );
				},
			} );
		}
	};

	const renderPrivacyProtection = () => {
		return (
			<>
				<ToggleControl
					__nextHasNoMarginBottom
					checked={ domain.private_domain }
					disabled={ isUpdatingPrivacy || ! domain.privacy_available }
					onChange={ togglePrivacyProtection }
					label={ __( 'Privacy protection' ) }
				/>

				{ ! domain.privacy_available && (
					<Text as="p" variant="muted">
						{ createInterpolateElement(
							domain.private_domain
								? __(
										'Privacy protection must be enabled due to the registry’s policies. <learnMoreLink />'
								  )
								: __(
										'Privacy protection is not available due to the registry’s policies. <learnMoreLink />'
								  ),
							{
								learnMoreLink: (
									<InlineSupportLink supportContext="domain-registrations-and-privacy" />
								),
							}
						) }
					</Text>
				) }
			</>
		);
	};

	const togglePrivacyDisclosure = () => {
		if ( domain.contact_info_disclosed ) {
			redactPrivacyMutation.mutate( undefined, {
				onSuccess: () => {
					createSuccessNotice( __( 'Your contact information is now redacted!' ), {
						type: 'snackbar',
					} );
				},
				onError: ( error: Error ) => {
					createErrorNotice( error.message, {
						type: 'snackbar',
					} );
				},
			} );
		} else {
			disclosePrivacyMutation.mutate( undefined, {
				onSuccess: () => {
					createSuccessNotice( __( 'Your contact information is now publicly visible!' ), {
						type: 'snackbar',
					} );
				},
				onError: ( error: Error ) => {
					createErrorNotice( error.message, {
						type: 'snackbar',
					} );
				},
			} );
		}
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
					onChange={ togglePrivacyDisclosure }
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
			{ renderPrivacyDisclosure() }

			{ domain.privacy_available && (
				<Text as="p" variant="muted">
					{ createInterpolateElement(
						__( 'We recommend keeping privacy protection on. <learnMoreLink />' ),
						{
							learnMoreLink: (
								<InlineSupportLink supportContext="domain-registrations-and-privacy" />
							),
						}
					) }
				</Text>
			) }
		</VStack>
	);
}
