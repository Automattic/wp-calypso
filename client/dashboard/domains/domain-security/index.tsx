import { Badge } from '@automattic/ui';
import { CONTACT } from '@automattic/urls';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import {
	Button,
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { ReactElement } from 'react';
import { domainQuery } from '../../app/queries/domain';
import { provisionSslCertificateMutation, sslDetailsQuery } from '../../app/queries/domain-ssl';
import { domainRoute } from '../../app/router/domains';
import InlineSupportLink from '../../components/inline-support-link';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';

export default function DomainSecurity() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: sslDetails } = useSuspenseQuery( sslDetailsQuery( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const mutation = useMutation( provisionSslCertificateMutation( domainName ) );

	const { isPending } = mutation;

	const handleOnClick = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( undefined, {
			onSuccess: () => {
				createSuccessNotice( __( 'New certificate requested.' ), { type: 'snackbar' } );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to provision SSL certificate.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	const shouldShowProvisionButton =
		! sslDetails.certificate_provisioned &&
		! sslDetails.is_newly_registered &&
		! sslDetails.is_expired &&
		sslDetails?.failure_reasons;

	const renderFailureReasons = (
		failureReasons: { error_type: string; message: string }[]
	): ReactElement => {
		return (
			<ul>
				{ failureReasons.map( ( failureReason ) => {
					const isDnssecErrorForManagedSubdomain =
						failureReason.error_type === 'DNSSEC validation error' &&
						domain.is_subdomain &&
						domain.is_root_domain_registered_with_automattic;
					return (
						<li key={ failureReason.error_type }>
							{ isDnssecErrorForManagedSubdomain
								? createInterpolateElement(
										sprintf(
											/* translators: %s is the root domain <a> will be replaced with an anchor tag to open the roor domain management page, <strong> will be replaced with a bolded text */
											__(
												'This domain has DNSSEC validation errors. You may need to deactivate DNSSEC on the root domain <strong>%s</strong>, from <a>here</a>.'
											),
											'test.com'
										),
										{
											link: (
												<a
													href={ `/domains/${ domain.name.replace(
														`${ domain.subdomain_part }.`,
														''
													) }` }
													target="_blank"
													rel="noreferrer"
												/>
											),
											strong: <strong />,
										}
								  )
								: failureReason.message }
						</li>
					);
				} ) }
			</ul>
		);
	};

	const renderSslStatusMessage = () => {
		if ( sslDetails.certificate_provisioned ) {
			return (
				<Text>
					{ __(
						'We give you strong HTTPS encryption with your domain for free. This provides a trust indicator for your visitors and keeps their connection to your site secure.'
					) }
				</Text>
			);
		}
		if ( sslDetails.is_newly_registered ) {
			return (
				<Text>
					{ __(
						'Your newly registered domain is almost ready! It can take up to 30 minutes for the domain to start resolving to your site so we can issue a certificate. Please check back soon.'
					) }
				</Text>
			);
		}
		if ( sslDetails.is_expired ) {
			return (
				<Text>
					{ __( 'Your domain has expired. Renew your domain to issue a new SSL certificate.' ) }
				</Text>
			);
		}
		if ( sslDetails.failure_reasons ) {
			if ( sslDetails.failure_reasons.length > 0 ) {
				return (
					<>
						<Text>
							{ __(
								'There are one or more problems with your DNS configuration that prevent an SSL certificate from being issued:'
							) }
						</Text>
						{ renderFailureReasons( sslDetails.failure_reasons ) }
						<Text>
							{ __(
								'Once you have fixed all the issues, you can request a new certificate by clicking the button below.'
							) }
						</Text>
					</>
				);
			}
			return (
				<Text>
					{ __(
						'There was a problem issuing your SSL certificate. You can request a new certificate by clicking the button below.'
					) }
				</Text>
			);
		}
		return (
			<Text>
				{ createInterpolateElement(
					__(
						'There is an issue with your certificate. Contact us to {{link}}learn more{{/link}}.'
					),
					{
						link: <InlineSupportLink supportLink={ CONTACT } />,
					}
				) }
			</Text>
		);

		return null;
	};

	const renderBadge = () => {
		if ( sslDetails.certificate_provisioned ) {
			return (
				<Badge intent="success" style={ { width: 'fit-content' } }>
					{ __( 'SSL active' ) }
				</Badge>
			);
		}
		return (
			<Badge intent="warning" style={ { width: 'fit-content' } }>
				{ __( 'SSL pending' ) }
			</Badge>
		);
	};

	return (
		<PageLayout size="small" header={ <PageHeader title="Security" /> }>
			<Card>
				<CardBody>
					<VStack spacing={ 2 }>
						<SectionHeader title={ __( 'SSL certificate' ) } level={ 3 } />
						<VStack spacing={ 6 }>
							{ renderBadge() }
							{ renderSslStatusMessage() }
							<HStack justify="flex-start">
								{ shouldShowProvisionButton && (
									<Button
										variant="primary"
										type="submit"
										isBusy={ isPending }
										disabled={ isPending }
										onClick={ handleOnClick }
									>
										{ __( 'Provision SSL certificate' ) }
									</Button>
								) }
							</HStack>
						</VStack>
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
