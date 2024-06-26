import { useSelector } from 'calypso/state';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';

export function useFlowLocale() {
	return useSelector( getCurrentLocaleSlug );
}
