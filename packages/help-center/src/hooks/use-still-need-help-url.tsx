/* eslint-disable no-restricted-imports */

import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { useShouldUseWapuu } from './use-should-use-wapuu';

export function useStillNeedHelpURL() {
	const shouldUseWapuu = useShouldUseWapuu();

	let url = '/contact-form';

	if ( shouldUseWapuu && ! isA8CForAgencies() ) {
		url = '/odie';
	}

	return { url, isLoading: false };
}
