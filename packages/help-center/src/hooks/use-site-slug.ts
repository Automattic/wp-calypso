import { useHelpCenterContext } from '../contexts/HelpCenterContext';

export function useSiteSlug() {
	const { site } = useHelpCenterContext();
	return site && new URL( site.URL ).host;
}
