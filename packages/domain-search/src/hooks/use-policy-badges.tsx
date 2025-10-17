import { PolicyNotice } from '@automattic/api-core';
import { localizeUrl } from '@automattic/i18n-utils';
import { HTTPS_SSL } from '@automattic/urls';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { type ReactNode, useMemo } from 'react';
import { DomainSuggestionBadge } from '../ui';
import { useSuggestion } from './use-suggestion';

export const usePolicyBadges = ( domainName: string ) => {
	const { __ } = useI18n();
	const suggestion = useSuggestion( domainName );

	const badges = useMemo( () => {
		const computedBadges: ReactNode[] = [];
		const policyNotices = suggestion.policy_notices || [];

		const getPolicyNoticeMessage = ( { type, message }: PolicyNotice ) => {
			if ( type === 'hsts' ) {
				return createInterpolateElement(
					sprintf(
						/* translators: %(message)s is the message of the policy notice. */
						__(
							'%(message)s When you host this domain at WordPress.com, an SSL certificate is included. <a>Learn more</a>.'
						),
						{
							message,
						}
					),
					{
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
					}
				);
			}

			return message;
		};

		policyNotices.forEach( ( notice ) => {
			computedBadges.push(
				<DomainSuggestionBadge key={ notice.type } popover={ getPolicyNoticeMessage( notice ) }>
					{ notice.label }
				</DomainSuggestionBadge>
			);
		} );

		return computedBadges;
	}, [ __, suggestion.policy_notices ] );

	return badges;
};
