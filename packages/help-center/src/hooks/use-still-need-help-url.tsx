/* eslint-disable no-restricted-imports */

import { useShouldUseWapuu } from './use-should-use-wapuu';

export function useStillNeedHelpURL() {
	const shouldUseWapuu = useShouldUseWapuu();

	const url = shouldUseWapuu ? '/odie' : '/contact-form';
	return { url, isLoading: false };
}
