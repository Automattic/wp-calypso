import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { CONTACT, HTTPS_SSL } from '@automattic/urls';
import { Icon, lock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Accordion from 'calypso/components/domains/accordion';
import useSslDetailsQuery from 'calypso/data/domains/ssl/use-ssl-details-query';
import useProvisionCertificateMutation from 'calypso/data/domains/ssl/use-ssl-provision-certificate-mutation';
import { sslStatuses } from 'calypso/lib/domains/constants';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSslReadableStatus, isSecuredWithUs } from '../../helpers';
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
		isFetching: isLoadingSSLData,
		isError,
		isStale,
		refetch: refetchSSLStatusData,
	} = useSslDetailsQuery( domain.name );

	// Display success notices when SSL certificate is provisioned
	const { provisionCertificate, isPending: isProvisioningCertificate } =
		useProvisionCertificateMutation( domain.name, {
			onSuccess() {
				dispatch(
					successNotice( translate( 'New certificate provisioning requested' ), noticeOptions )
				);
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
					translate( 'An error occurred while fetching ssl certificate details.' ),
					noticeOptions
				)
			);
		}
	}, [ isError, dispatch, translate ] );

	useEffect( () => {
		if ( isStale && domain.sslStatus === sslStatuses.SSL_PENDING ) {
			refetchSSLStatusData();
		}
	}, [ isStale, domain.sslStatus, refetchSSLStatusData ] );

	if ( ! isSecuredWithUs( domain ) ) {
		return null;
	}

	const { sslStatus } = domain;

	const getSslStatusMessage = () => {
		switch ( sslStatus ) {
			case sslStatuses.SSL_ACTIVE:
				return null;
			case sslStatuses.SSL_PENDING:
				if ( sslDetails?.is_newly_registered ) {
					return translate(
						'It may take up to a few hours to add an SSL certificate to your site. If you are not seeing it yet, give it some time to take effect.',
						{ textOnly: true }
					);
				}
				if ( sslDetails?.failure_reasons ) {
					return (
						<>
							<p className="domain-security-details__description-message">
								{ translate(
									'There are one or more problems with your DNS configuration that prevent SSL certificate from being issued:'
								) }
							</p>
							<ul>
								{ sslDetails.failure_reasons?.map( ( failureReason ) => {
									return <li key={ failureReason.error_type }>{ failureReason.message }</li>;
								} ) }
							</ul>
							<p className="domain-security-details__description-message">
								{ translate(
									'Once you have fixed all the issue, you can request a new certificate by clicking the button below.'
								) }
							</p>
						</>
					);
				}
				return translate(
					'There is an issue with your certificate. Contact us to {{a}}learn more{{/a}}.',
					{ components: { a: <a href={ localizeUrl( CONTACT ) } /> } }
				);
			case sslStatuses.SSL_DISABLED:
			default:
				return translate(
					'Your domain has expired. Renew you domain to issue a new SSL certificate.'
				);
		}
	};

	const handleProvisionCertificate = () => {
		provisionCertificate();
	};

	return (
		<Accordion
			title={ translate( 'Domain security', { textOnly: true } ) }
			subtitle={ getSslReadableStatus( domain ) }
			key="security"
			isDisabled={ isDisabled }
			expanded={ isExpanded }
			onOpen={ () => setIsExpanded( true ) }
			onClose={ () => setIsExpanded( false ) }
		>
			<div className="domain-security-details__card">
				<div
					className={ `domain-security-details__icon domain-security-details__icon--${
						sslStatuses.SSL_ACTIVE === sslStatus ? 'success' : 'warning'
					}` }
				>
					<>
						<Icon icon={ lock } size={ 18 } viewBox="0 0 22 22" />
						{ getSslReadableStatus( domain ) }
					</>
				</div>
				<div className="domain-security-details__description">
					{ ! isLoadingSSLData && getSslStatusMessage() }
					<Button
						className="domain-security-details__provision-button"
						disabled={ isProvisioningCertificate }
						onClick={ handleProvisionCertificate }
					>
						Provision certificate
					</Button>
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
