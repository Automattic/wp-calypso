import { Badge } from '@automattic/ui';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
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
import { domainRoute, domainSecurityRoute } from '../../app/router/domains';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { useSslStatusMessage } from './use-ssl-status-message';

export default function DomainSecurity() {
	const { domainName } = domainRoute.useParams();
	const { data: domain } = useSuspenseQuery( domainQuery( domainName ) );
	const { data: sslDetails } = useSuspenseQuery( sslDetailsQuery( domainName ) );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const mutation = useMutation( provisionSslCertificateMutation( domainName ) );

	const { message } = useSslStatusMessage( sslDetails );

	const showFailureReasons = !! sslDetails.failure_reasons && sslDetails.failure_reasons.length > 0;

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
										sprintf(
											/* translators: %s is the root domain <link> will be replaced with a link to open the root domain security page, <strong> will be replaced with a bolded text */
											__(
												'This domain has DNSSEC validation errors. You may need to deactivate DNSSEC on the root domain <strong>%s</strong>, from <link>here</link>.'
											),
											domainName.replace( `${ domain?.subdomain_part }.`, '' )
										),
										{
											link: (
												<Link
													to={ domainSecurityRoute.fullPath }
													params={ {
														domainName: domainName.replace( `${ domain?.subdomain_part }.`, '' ),
													} }
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
							<Text>{ message }</Text>
							{ showFailureReasons && renderFailureReasons( sslDetails.failure_reasons ?? [] ) }
							{ showFailureReasons && (
								<Text>
									{ __(
										'Once you have fixed all the issues, you can request a new certificate by clicking the button below.'
									) }
								</Text>
							) }
							{ shouldShowProvisionButton && (
								<HStack justify="flex-start">
									<Button
										__next40pxDefaultSize
										variant="primary"
										isBusy={ mutation.isPending }
										disabled={ mutation.isPending }
										onClick={ handleOnClick }
									>
										{ __( 'Provision certificate' ) }
									</Button>
								</HStack>
							) }
						</VStack>
					</VStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
