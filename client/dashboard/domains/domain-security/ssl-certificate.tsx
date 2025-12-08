import { provisionSslCertificateMutation } from '@automattic/api-queries';
import { Badge } from '@automattic/ui';
import { CONTACT } from '@automattic/urls';
import { useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ReactElement } from 'react';
import { useAnalytics } from '../../app/analytics';
import { domainSecurityRoute } from '../../app/router/domains';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import { SectionHeader } from '../../components/section-header';
import type { Domain, SslDetails } from '@automattic/api-core';

interface SslCertificateProps {
	domainName: string;
	domain: Domain;
	sslDetails: SslDetails;
}

export default function SslCertificate( { domainName, domain, sslDetails }: SslCertificateProps ) {
	const { recordTracksEvent } = useAnalytics();
	const mutation = useMutation( {
		...provisionSslCertificateMutation( domainName ),
		meta: {
			snackbar: {
				success: __( 'New SSL certificate requested.' ),
				error: __( 'Failed to provision SSL certificate.' ),
			},
		},
	} );

	const getSslStatusMessage = ( sslDetails: SslDetails ) => {
		const hasFailureReasons =
			!! sslDetails.failure_reasons && sslDetails.failure_reasons.length > 0;

		if ( sslDetails.certificate_provisioned ) {
			return createInterpolateElement(
				__(
					/* translators: <learnMoreLink> will be replaced with an a support link */
					'We give you strong HTTPS encryption with your domain for free. This provides a trust indicator for your visitors and keeps their connection to your site secure. <learnMoreLink />'
				),
				{
					learnMoreLink: (
						<InlineSupportLink
							supportContext="https-ssl"
							onClick={ () => {
								recordTracksEvent( 'calypso_dashboard_domain_security_learn_more_click', {
									domain: domainName,
								} );
							} }
						/>
					),
				}
			);
		}

		if ( sslDetails.is_newly_registered ) {
			return __(
				'Your newly registered domain is almost ready! It can take up to 30 minutes for the domain to start resolving to your site so we can issue a new SSL certificate. Please check back soon.'
			);
		}

		if ( sslDetails.is_expired ) {
			return __( 'Your domain has expired. Renew your domain to issue a new SSL certificate.' );
		}

		if ( hasFailureReasons ) {
			return __(
				'There are one or more problems with your DNS configuration that prevent an SSL certificate from being issued.'
			);
		}

		// If we get here, there is an issue with the certificate that can be fixed by the user.
		return createInterpolateElement(
			__( 'There is an issue with your certificate. Contact us to <learnMoreLink />.' ),
			{
				learnMoreLink: (
					<InlineSupportLink
						supportLink={ CONTACT }
						onClick={ () => {
							recordTracksEvent( 'calypso_dashboard_domain_security_learn_more_click', {
								domain: domainName,
							} );
						} }
					/>
				),
			}
		);
	};

	const showFailureReasons = !! sslDetails.failure_reasons && sslDetails.failure_reasons.length > 0;

	const shouldShowProvisionButton =
		! sslDetails.certificate_provisioned &&
		! sslDetails.is_newly_registered &&
		! sslDetails.is_expired &&
		showFailureReasons;

	const handleOnClick = ( e: React.FormEvent ) => {
		e.preventDefault();

		recordTracksEvent( 'calypso_dashboard_ssl_provision', {
			domain: domainName,
		} );

		mutation.mutate( undefined, {
			onSuccess: () => {
				// Track success
				recordTracksEvent( 'calypso_dashboard_ssl_provision_success', {
					domain: domainName,
				} );
			},
			onError: ( error: Error ) => {
				// Track failure
				recordTracksEvent( 'calypso_dashboard_ssl_provision_failure', {
					domain: domainName,
					error_message: error.message,
				} );
			},
		} );
	};

	const renderFailureReasons = (
		failureReasons: { error_type: string; message: string }[]
	): ReactElement => {
		return (
			<ul style={ { margin: 0 } }>
				{ failureReasons.map( ( failureReason ) => {
					const isDnssecErrorForManagedSubdomain =
						failureReason.error_type === 'DNSSEC validation error' &&
						domain.is_subdomain &&
						domain.is_root_domain_registered_with_automattic;

					return (
						<li key={ failureReason.error_type }>
							{ isDnssecErrorForManagedSubdomain
								? createInterpolateElement(
										/* translators: <domain> is the root domain <link> will be replaced with a link to open the root domain security page */
										__(
											'This domain has DNSSEC validation errors. You may need to deactivate DNSSEC on the root domain <domain/>, from <link>here</link>.'
										),
										{
											link: (
												<Link
													to={ domainSecurityRoute.fullPath }
													params={ {
														domainName: domain?.subdomain_part
															? domainName.replace( `${ domain.subdomain_part }.`, '' )
															: domainName,
													} }
												/>
											),
											domain: (
												<strong>
													{ domain?.subdomain_part
														? domainName.replace( `${ domain.subdomain_part }.`, '' )
														: domainName }
												</strong>
											),
										}
								  )
								: failureReason.message }
						</li>
					);
				} ) }
			</ul>
		);
	};

	const renderBadge = () => {
		if ( sslDetails.certificate_provisioned || domain.wpcom_domain ) {
			return <Badge intent="success">{ __( 'SSL active' ) }</Badge>;
		}
		return <Badge intent="warning">{ __( 'SSL pending' ) }</Badge>;
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 2 }>
					<SectionHeader title={ __( 'SSL certificate' ) } level={ 3 } />
					<VStack spacing={ 6 }>
						<HStack justify="flex-start">{ renderBadge() }</HStack>
						<Text>{ getSslStatusMessage( sslDetails ) }</Text>
						{ showFailureReasons && renderFailureReasons( sslDetails.failure_reasons ?? [] ) }
						{ showFailureReasons && (
							<Text>
								{ __(
									'Once you have fixed all the issues, you can request a new certificate by clicking the button below.'
								) }
							</Text>
						) }
						{ shouldShowProvisionButton && (
							<ButtonStack justify="flex-start">
								<Button
									__next40pxDefaultSize
									variant="primary"
									isBusy={ mutation.isPending }
									disabled={ mutation.isPending }
									onClick={ handleOnClick }
								>
									{ __( 'Provision certificate' ) }
								</Button>
							</ButtonStack>
						) }
					</VStack>
				</VStack>
			</CardBody>
		</Card>
	);
}
