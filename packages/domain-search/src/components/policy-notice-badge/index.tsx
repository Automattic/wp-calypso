import { PolicyNotice } from '@automattic/api-core';
import { localizeUrl } from '@automattic/i18n-utils';
import { HTTPS_SSL } from '@automattic/urls';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import { DomainSuggestionBadge } from '../../ui';

export const PolicyNoticeBadge = ( { notice }: { notice: PolicyNotice } ) => {
	const { __ } = useI18n();
	const { type, label, message } = notice;

	const popover =
		type === 'hsts'
			? createInterpolateElement(
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
				)
			: message;

	return <DomainSuggestionBadge popover={ popover }>{ label }</DomainSuggestionBadge>;
};
