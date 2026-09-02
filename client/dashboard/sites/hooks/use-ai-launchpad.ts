import { getAiLaunchpadStatus } from '@automattic/api-core';
import { siteAiLaunchpadQuery, siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

export function useAiLaunchpad(
	siteSlug: string,
	{ withTasks = false }: { withTasks?: boolean } = {}
) {
	const { data: site } = useQuery( {
		...siteBySlugQuery( siteSlug ),
		// Cache-only: the sites list primes this cache for every row and the site
		// route loader ensures it, so never fire a request from here — a disabled
		// query still returns cached data reactively. If the cache was never
		// populated, the status stays null and legacy behavior applies.
		enabled: false,
	} );

	const status = site ? getAiLaunchpadStatus( site ) : null;
	const isActive = status === 'active';

	const { data: aiLaunchpad } = useQuery( {
		...siteAiLaunchpadQuery( site?.ID ?? 0 ),
		enabled: withTasks && isActive,
	} );

	const adminUrl = site?.options?.admin_url;

	return {
		isActive,
		isCompleted: status === 'completed',
		setupUrl: isActive && adminUrl ? `${ adminUrl }admin.php?page=site-setup-wp-admin` : null,
		tasks: aiLaunchpad?.tasks,
	};
}
