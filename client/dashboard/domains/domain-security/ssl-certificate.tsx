import { provisionSslCertificateMutation } from '@automattic/api-queries';
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
import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';
import { ReactElement } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useIntlLocale } from '../../app/locale';
import { domainSecurityRoute } from '../../app/router/domains';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import { SectionHeader } from '../../components/section-header';
import { parseDateAsUTC } from '../../utils/datetime';
import { useSslStatusLabels } from './use-ssl-status-labels';
import type { Domain, SslDetails } from '@automattic/api-core';

interface SslCertificateProps {
	domainName: string;
	domain: Domain;
	sslDetails: SslDetails;
}

const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;
const OVERDUE_ATTEMPT_IN_MS = 3 * HOUR_IN_MS;

/**
 * Returns a string like "in 5 minutes", or null when the date is less than a minute away or has passed.
 */
function getTimeUntil( date: Date, locale: string ): string | null {
	const diff = date.getTime() - Date.now();
	if ( Number.isNaN( diff ) || diff < MINUTE_IN_MS ) {
		return null;
	}

	const formatter = new Intl.RelativeTimeFormat( locale, { numeric: 'always' } );
	if ( diff < HOUR_IN_MS ) {
		return formatter.format( Math.round( diff / MINUTE_IN_MS ), 'minute' );
	}
	if ( diff < 2 * DAY_IN_MS ) {
		return formatter.format( Math.round( diff / HOUR_IN_MS ), 'hour' );
	}
	return formatter.format( Math.round( diff / DAY_IN_MS ), 'day' );
}

export default function SslCertificate( { domainName, domain, sslDetails }: SslCertificateProps ) {
	const { recordTracksEvent } = useAnalytics();
	const locale = useIntlLocale();
	const sslStatusLabels = useSslStatusLabels();
	const mutation = useMutation(
		withSnackbar( provisionSslCertificateMutation( domainName ), {
			/* translators: %s is the domain name */
			success: sprintf( __( 'New SSL certificate requested for %s.' ), domainName ),
			error: { source: 'server' },
		} )
	);

	const isFailed =
		! sslDetails.certificate_provisioned &&
		( sslDetails.certificate_status
			? sslDetails.certificate_status === 'failed'
			: domain.ssl_status === 'failed' );

	const lastError = sslDetails.last_error?.message;

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

		if ( isFailed ) {
			return createInterpolateElement(
				__(
					'We could not issue an SSL certificate for this domain and have stopped retrying automatically. <learnMoreLink />'
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

		if ( hasFailureReasons ) {
			return createInterpolateElement(
				__(
					'There are one or more problems with your DNS configuration that prevent an SSL certificate from being issued. <learnMoreLink />'
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

		if ( lastError ) {
			return createInterpolateElement(
				__(
					'The last attempt to issue an SSL certificate for this domain did not succeed. We will try again automatically. <learnMoreLink />'
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

	const canRetry =
		! sslDetails.certificate_provisioned &&
		! sslDetails.is_newly_registered &&
		! sslDetails.is_expired;

	const hasKnownIssue = showFailureReasons || !! lastError;
	const nextAttempt = sslDetails.next_attempt ? parseDateAsUTC( sslDetails.next_attempt ) : null;
	const isNextAttemptOverdue =
		! isFailed && !! nextAttempt && Date.now() - nextAttempt.getTime() > OVERDUE_ATTEMPT_IN_MS;
	const shouldShowProvisionButton =
		canRetry && ( hasKnownIssue || isFailed || isNextAttemptOverdue );

	const renderAttemptDetails = () => {
		if ( ! canRetry ) {
			return null;
		}

		const hasNextAttempt = ! isFailed && !! nextAttempt && ! isNextAttemptOverdue;
		if ( ! lastError && ! hasNextAttempt ) {
			return null;
		}

		const timeUntilNextAttempt = nextAttempt ? getTimeUntil( nextAttempt, locale ) : null;

		return (
			<VStack spacing={ 1 }>
				{ lastError && (
					<Text>
						{ createInterpolateElement(
							/* translators: <error/> is the reason the last attempt to issue the SSL certificate failed */
							__( '<strong>Last error:</strong> <error/>' ),
							{ strong: <strong />, error: <>{ lastError }</> }
						) }
					</Text>
				) }
				{ hasNextAttempt && (
					<Text>
						{ createInterpolateElement(
							timeUntilNextAttempt
								? sprintf(
										/* translators: %s is a relative time like "in 5 minutes" or "in 2 days" */
										__( '<strong>Next attempt:</strong> %s' ),
										timeUntilNextAttempt
									)
								: __( '<strong>Next attempt:</strong> soon' ),
							{ strong: <strong /> }
						) }
					</Text>
				) }
			</VStack>
		);
	};

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
			return <Badge intent="stable">{ sslStatusLabels.active }</Badge>;
		}
		if ( isFailed ) {
			return <Badge intent="high">{ sslStatusLabels.failed }</Badge>;
		}
		if (
			sslDetails.certificate_status === 'pending' ||
			domain.ssl_status === 'newly_registered' ||
			domain.ssl_status === 'pending'
		) {
			return <Badge intent="low">{ sslStatusLabels.pending }</Badge>;
		}
		return <Badge intent="high">{ sslStatusLabels.disabled }</Badge>;
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 2 }>
					<SectionHeader title={ __( 'SSL certificate' ) } level={ 3 } />
					<VStack spacing={ 6 }>
						<HStack justify="flex-start">{ renderBadge() }</HStack>
						<Text>{ getSslStatusMessage( sslDetails ) }</Text>
						{ renderAttemptDetails() }
						{ showFailureReasons && renderFailureReasons( sslDetails.failure_reasons ?? [] ) }
						{ shouldShowProvisionButton && hasKnownIssue && (
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
