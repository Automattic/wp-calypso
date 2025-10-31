import { initSentry } from '@automattic/calypso-sentry';
import type { User } from '@automattic/api-core';
import type { AnyRouter } from '@tanstack/react-router';

export function setupErrorLogging( user: User, router: AnyRouter ) {
	initSentry( {
		userId: user.ID,
		beforeSend: ( event ) => {
			const lastMatch = router.state.matches.at( -1 );
			const site_slug = lastMatch?.params?.siteSlug;
			const full_path = lastMatch?.fullPath;

			event.tags = {
				site_slug,
				full_path,
				...event.tags,
			};

			return event;
		},
	} );
}
