import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { CONTACT, HTTPS_SSL } from '@automattic/urls';
import { Icon, lock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { ReactElement, useEffect, useState } from 'react';
import Accordion from 'calypso/components/domains/accordion';
import useSslDetailsQuery from 'calypso/data/domains/ssl/use-ssl-details-query';
import useProvisionCertificateMutation from 'calypso/data/domains/ssl/use-ssl-provision-certificate-mutation';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSslReadableStatusFromSslDetail } from '../../helpers';
import type { SecurityCardProps } from '../types';

import './style.scss';

const noticeOptions = {
	duration: 5000,
	id: `ssl-status-notification`,
};

const DomainSecurityDetails = ( { domain, isDisabled }: SecurityCardProps ) => {
	const dispatch = useDispatch();

	const translate = useTranslate();
	const [ isExpanded, setIsExpanded ] = useState( false );

	const {
		data: sslDetails,
		isFetching: isLoadingSSLDetails,
		isError,
		isStale,
		refetch: refetchSSLDetails,
	} = useSslDetailsQuery( domain.name );

	// Display success notices when SSL certificate is provisioned
	const { provisionCertificate, isPending: isProvisioningCertificate } =
		useProvisionCertificateMutation( domain.name, {
			onSuccess() {
				dispatch( successNotice( translate( 'New certificate requested' ), noticeOptions ) );
			},
			onError( error ) {
				dispatch( errorNotice( error.message, noticeOptions ) );
			},
		} );

	// Render an error if ssl details fails to load
	useEffect( () => {
		if ( isError ) {
			dispatch(
				errorNotice(
					translate( 'An error occurred while fetching SSL certificate details.' ),
					noticeOptions
				)
			);
		}
	}, [ isError, dispatch, translate ] );

	useEffect( () => {
		if ( isStale ) {
			refetchSSLDetails();
		}
	}, [ isStale, refetchSSLDetails ] );

	const getSslStatusMessage = (): ReactElement | null => {
		if ( isLoadingSSLDetails || ! sslDetails || sslDetails.certificate_provisioned ) {
			return null;
		}

		if ( sslDetails.is_newly_registered ) {
			return (
				<p className="domain-security-details__description-message">
					{ translate(
						'Your newly registered domain is almost ready! It can take up to 30 minutes for the domain to start resolving to your site so we can issue a certificate. Please check back soon.',
						{ textOnly: true }
					) }
				</p>
			);
		}

		if ( sslDetails.is_expired ) {
			return (
				<p className="domain-security-details__description-message">
					{ translate(
						'Your domain has expired. Renew your domain to issue a new SSL certificate.'
					) }
				</p>
			);
		}

		if ( sslDetails?.failure_reasons ) {
			return (
				<>
					<p className="domain-security-details__description-message">
						{ translate(
							'There are one or more problems with your DNS configuration that prevent an SSL certificate from being issued:'
						) }
					</p>
					<ul>
						{ sslDetails.failure_reasons?.map( ( failureReason ) => {
							return <li key={ failureReason.error_type }>{ failureReason.message }</li>;
						} ) }
					</ul>
					<p className="domain-security-details__description-message">
						{ translate(
							'Once you have fixed all the issues, you can request a new certificate by clicking the button below.'
						) }
					</p>
				</>
			);
		}
		return (
			<p className="domain-security-details__description-message">
				{ translate(
					'There is an issue with your certificate. Contact us to {{a}}learn more{{/a}}.',
					{ components: { a: <a href={ localizeUrl( CONTACT ) } /> } }
				) }
			</p>
		);
	};

	const handleProvisionCertificate = () => {
		provisionCertificate();
	};

	if ( isLoadingSSLDetails || ! sslDetails ) {
		return null;
	}

	return (
		<Accordion
			title={ translate( 'Domain security', { textOnly: true } ) }
			subtitle={ isExpanded ? '' : getSslReadableStatusFromSslDetail( sslDetails ) }
			key="security"
			isDisabled={ isDisabled }
			expanded={ isExpanded }
			onOpen={ () => setIsExpanded( true ) }
			onClose={ () => setIsExpanded( false ) }
		>
			<div className="domain-security-details__card">
				<div
					className={ `domain-security-details__icon domain-security-details__icon--${
						sslDetails.certificate_provisioned ? 'success' : 'warning'
					}` }
				>
					<>
						<Icon icon={ lock } size={ 18 } viewBox="0 0 22 22" />
						{ getSslReadableStatusFromSslDetail( sslDetails ) }
					</>
				</div>
				<div className="domain-security-details__description">
					{ getSslStatusMessage() }
					{ ! sslDetails.certificate_provisioned &&
						! sslDetails.is_newly_registered &&
						! sslDetails.is_expired &&
						sslDetails?.failure_reasons && (
							<Button
								className="domain-security-details__provision-button"
								disabled={ isProvisioningCertificate }
								onClick={ handleProvisionCertificate }
							>
								{ translate( 'Provision certificate' ) }
							</Button>
						) }
					<div className="domain-security-details__description-help-text">
						{ translate(
							'We give you strong HTTPS encryption with your domain for free. This provides a trust indicator for your visitors and keeps their connection to your site secure. {{a}}Learn more{{/a}}',
							{ components: { a: <a href={ localizeUrl( HTTPS_SSL ) } /> } }
						) }
					</div>
				</div>
			</div>
		</Accordion>
	);
};

export default DomainSecurityDetails;
