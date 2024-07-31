import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { CONTACT, HTTPS_SSL } from '@automattic/urls';
import { Icon, lock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Accordion from 'calypso/components/domains/accordion';
import useDomainSSLStatusQuery from 'calypso/data/domains/ssl/use-domain-ssl-status-query';
import { sslStatuses } from 'calypso/lib/domains/constants';
import { errorNotice } from 'calypso/state/notices/actions';
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
		data,
		isFetching: isLoadingData,
		isError,
		isStale,
		refetch: refetchSSLStatusData,
	} = useDomainSSLStatusQuery( domain.name );

	// Render an error if ssl status fails to load
	useEffect( () => {
		if ( isError ) {
			dispatch(
				errorNotice(
					translate( 'An error occurred while fetching your glue record.' ),
					noticeOptions
				)
			);
		}
	}, [ isError, dispatch, translate ] );

	useEffect( () => {
		if ( isExpanded && isStale ) {
			refetchSSLStatusData();
		}
	}, [ isExpanded, isStale, refetchSSLStatusData ] );

	useEffect( () => {
		if ( isLoadingData || ! data ) {
			return;
		}
	}, [ isLoadingData, data ] );

	if ( ! isSecuredWithUs( domain ) ) {
		return null;
	}

	const { sslStatus } = domain;

	const getSslStatusMessage = () => {
		switch ( sslStatus ) {
			case sslStatuses.SSL_ACTIVE:
				return null;
			case sslStatuses.SSL_PENDING:
				return translate(
					'It may take up to a few hours to add an SSL certificate to your site. If you are not seeing it yet, give it some time to take effect.',
					{ textOnly: true }
				);
			case sslStatuses.SSL_DISABLED:
			default:
				return translate(
					'There is an issue with your certificate. Contact us to {{a}}learn more{{/a}}.',
					{ components: { a: <a href={ localizeUrl( CONTACT ) } /> } }
				);
		}
	};

	const sslStatusMessage = getSslStatusMessage();

	const expandCard = () => {
		setIsExpanded( true );
		// We want to always fetch the latest ssl status when the card is expanded
		// otherwise the user might see stale data if they made an update and refreshed the page
		// refetchGlueRecordsData();
		refetchSSLStatusData();

		recordTracksEvent( 'calypso_domain_ssl_status_expand_card_click', {
			domain: domain.domain,
		} );
	};

	return (
		<Accordion
			title={ translate( 'Domain security', { textOnly: true } ) }
			subtitle={ getSslReadableStatus( domain ) }
			key="security"
			isDisabled={ isDisabled }
			expanded={ isExpanded }
			onOpen={ expandCard }
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
					{ sslStatusMessage && (
						<p className="domain-security-details__description-message">{ sslStatusMessage }</p>
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
