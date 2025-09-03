import { PolicyNotice } from '@automattic/api-core';
import { localizeUrl } from '@automattic/i18n-utils';
import { HTTPS_SSL } from '@automattic/urls';
import { useTranslate } from 'i18n-calypso';
import { useSuggestion } from './use-suggestion';

export const usePolicyNotices = ( domainName: string ): PolicyNotice[] => {
	const translate = useTranslate();
	const suggestion = useSuggestion( domainName );
	const policyNotices = suggestion.policy_notices || [];

	const getPolicyNoticeMessage = ( { type, message }: PolicyNotice ) => {
		if ( type === 'hsts' ) {
			return translate(
				'%(message)s When you host this domain at WordPress.com, an SSL certificate is included. {{a}}Learn more{{/a}}.',
				{
					args: {
						message: message,
					},
					components: {
						a: (
							<a
								href={ localizeUrl( HTTPS_SSL ) }
								target="_blank"
								rel="noopener noreferrer"
								onClick={ ( event ) => {
									event.stopPropagation();
								} }
							/>
						),
					},
				}
			);
		}

		return message;
	};

	return policyNotices.map( ( policyNotice ) => ( {
		...policyNotice,
		message: getPolicyNoticeMessage( policyNotice ),
	} ) );
};
