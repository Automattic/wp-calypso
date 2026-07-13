import { getAiLaunchpadStatus } from '@automattic/api-core';
import { siteAiLaunchpadQuery, siteBySlugQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';

export function useAiLaunchpad(
	siteSlug: string,
	{ withTasks = false }: { withTasks?: boolean } = {}
) {
	const { data: site } = useQuery( {
		...siteBySlugQuery( siteSlug ),
		// The sites list primes this cache for every row; without a staleTime,
		// the default staleTime of 0 would trigger a background refetch of each
		// rendered site.
		staleTime: 5 * 60 * 1000,
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
