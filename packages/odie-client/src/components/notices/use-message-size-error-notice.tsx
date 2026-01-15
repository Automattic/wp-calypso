import { sprintf, __ } from '@wordpress/i18n';
import { error, Icon } from '@wordpress/icons';

export const MAX_MESSAGE_LENGTH = 1000;

export default function useMessageSizeErrorNotice( messageLength: number ) {
	const isMessageTooLong = messageLength > MAX_MESSAGE_LENGTH;

	return isMessageTooLong
		? {
				icon: <Icon size={ 24 } icon={ error } />,
				message: sprintf(
					/* translators: %(messageLength)d is the current message length and %(maxMessageLength)d is the maximum message length. */
					__(
						'Maximum length reached (%(messageLength)d/%(maxMessageLength)d).',
						__i18n_text_domain__
					),
					{
						messageLength,
						maxMessageLength: MAX_MESSAGE_LENGTH,
					}
				),
				dismissible: true,
		  }
		: undefined;
}
