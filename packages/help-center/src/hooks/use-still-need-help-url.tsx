/* eslint-disable no-restricted-imports */

import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { useShouldUseWapuu } from './use-should-use-wapuu';

export function useStillNeedHelpURL() {
	const shouldUseWapuu = useShouldUseWapuu();

	let url = '/contact-form';

	if ( isA8CForAgencies() ) {
		url = '/a4a-contact-form';
	} else if ( shouldUseWapuu ) {
		url = '/odie';
	}

	return { url, isLoading: false };
}
