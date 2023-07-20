import { localizeUrl } from '@automattic/i18n-utils';
import { useMyDomainInputMode } from 'calypso/components/domains/connect-domain-step/constants';
import {
	INCOMING_DOMAIN_TRANSFER_BEFORE_YOU_GET_STARTED,
	INCOMING_DOMAIN_TRANSFER_AUTH_CODE_INVALID,
	INCOMING_DOMAIN_TRANSFER_PREPARE_UNLOCK,
} from 'calypso/lib/url/support';
import { domainUseMyDomain } from 'calypso/my-sites/domains/paths';
import type { I18N, TranslateResult } from 'i18n-calypso';

export function getDomainTransferErrorDescription(
	errorCode: string,
	siteSlug: string,
	domainName: string,
	translate: I18N[ 'translate' ]
): TranslateResult {
	const startTransferLink = (
		<a
			href={ domainUseMyDomain( siteSlug, domainName, useMyDomainInputMode.startPendingTransfer ) }
		/>
	);

	const getLinks = ( supportUrl?: string ): any => {
		return {
			components: {
				a: startTransferLink,
				a2: supportUrl ? (
					<a href={ localizeUrl( supportUrl ) } rel="noopener noreferrer" target="_blank" />
				) : null,
			},
		};
	};

	switch ( errorCode ) {
		case 'incorrect_auth_code':
			return translate(
				'The transfer failed because the provided auth code was incorrect. Please {{a}}try again{{/a}} with another code. {{a2}}Learn more{{/a2}}.',
				getLinks( INCOMING_DOMAIN_TRANSFER_AUTH_CODE_INVALID )
			);
		case 'domain_locked':
			return translate(
				'The domain is locked for transfer. Please unlock it and {{a}}try again{{/a}}. {{a2}}Learn more{{/a2}}.',
				getLinks( INCOMING_DOMAIN_TRANSFER_PREPARE_UNLOCK )
			);
		case 'domain_less_than_60_days_old':
			return translate(
				'The domain was registered less than 60 days ago and cannot be transferred. {{a2}}Learn more{{/a2}}',
				getLinks( INCOMING_DOMAIN_TRANSFER_BEFORE_YOU_GET_STARTED )
			);
		case 'retry_transfer':
			return translate( 'Please {{a}}try to start the transfer{{/a}} again.', getLinks() );
	}

	return translate(
		'An unknown transfer error occurred. Please {{a}}try again{{/a}} or contact support.',
		getLinks()
	);
}
