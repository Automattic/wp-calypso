import { recordTracksEvent } from '@automattic/calypso-analytics';
import { ContactOption } from '../types';

export const generateContactOnClickEvent = (
	contactOption: ContactOption,
	contactOptionEventName?: string
) => {
	if ( contactOptionEventName ) {
		recordTracksEvent( contactOptionEventName, {
			location: 'help-center',
			contact_option: contactOption,
		} );
	}
};
