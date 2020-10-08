/**
 * NOTE: This notice was created early in the COVID pandemic while we were still trying to understand
 * the long-term impacts on support volume. I'm leaving it here in case this specific language is useful
 * again in the future (it's already translated). But for other cases you can use the more generic
 * <ChatReducedAvailabilityNotice /> component instead.
 */

/**
 * External dependencies
 */

import React from 'react';
import { useTranslate } from 'i18n-calypso';
import 'moment-timezone'; // monkey patches the existing moment.js

/**
 * Internal dependencies
 */
import ContactFormNotice from 'calypso/me/help/contact-form-notice/index';

const ChatCovidLimitedAvailabilityNotice = ( { showAt, hideAt, compact } ) => {
	const translate = useTranslate();

	const heading = translate( 'Limited chat availability' );
	const message = translate(
		'{{p}}We’re anticipating that our availability in chat the next few days may be lower than normal. ' +
			'Our team is working to balance this moving forward so we can continue to support you and your ' +
			'site.{{/p}}' +
			'{{p}}We appreciate your patience during this time. While we may not be available immediately ' +
			'in chat, we will respond to your message by email at your account email address as soon as ' +
			'we can.{{/p}}',
		{ components: { p: <p /> } }
	);

	return (
		<ContactFormNotice
			showAt={ showAt }
			hideAt={ hideAt }
			heading={ heading }
			message={ message }
			compact={ compact }
		/>
	);
};

export default ChatCovidLimitedAvailabilityNotice;
