import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { useShouldUseWapuu } from './use-should-use-wapuu';

export function useStillNeedHelpURL() {
	const shouldUseWapuu = useShouldUseWapuu();
	const { product } = useHelpCenterContext();

	let url = '/contact-form';

	if ( shouldUseWapuu && product !== 'a4a' ) {
		url = '/odie';
	}

	return { url, isLoading: false };
}
