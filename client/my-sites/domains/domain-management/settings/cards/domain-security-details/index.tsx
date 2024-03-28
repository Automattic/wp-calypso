import { localizeUrl } from '@automattic/i18n-utils';
import { CONTACT, HTTPS_SSL } from '@automattic/urls';
import { Icon, lock } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { sslStatuses } from 'calypso/lib/domains/constants';
import { getSslReadableStatus, isSecuredWithUs } from '../../helpers';
import type { DetailsCardProps } from '../types';

import './style.scss';

const DomainSecurityDetails = ( { domain }: DetailsCardProps ) => {
	const translate = useTranslate();

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

	return (
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
	);
};

export default DomainSecurityDetails;
