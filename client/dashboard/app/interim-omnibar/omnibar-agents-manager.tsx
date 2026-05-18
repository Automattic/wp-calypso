import { useShouldUseUnifiedAgent } from '@automattic/agents-manager';
import { Suspense, lazy } from 'react';
import { useAuth } from '../auth';

const AsyncAgentsManager = lazy(
	() =>
		import(
			/* webpackChunkName: "async-load-automattic-agents-manager" */ '@automattic/agents-manager'
		)
);

/**
 * Renders the unified Big Sky chat experience when the current user has opted
 * into "Enable the unified AI chat experience in Help Center" on
 * /wp-admin/profile.php. The eligibility check goes through the same
 * `/wpcom/v2/agents-manager/state` endpoint used elsewhere in Calypso, so the
 * toggle stays consistent across /wp-admin, wordpress.com, and MSD.
 *
 * When not eligible, this renders nothing and the legacy `OmnibarHelpCenter`
 * handles the chat surface. When eligible, the legacy help center suppresses
 * itself inside `@automattic/help-center`, so only Big Sky is visible.
 */
export default function OmnibarAgentsManager() {
	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();
	const { user } = useAuth();

	if ( ! shouldUseUnifiedAgent ) {
		return null;
	}

	return (
		<Suspense fallback={ null }>
			<AsyncAgentsManager currentUser={ user } sectionName="dashboard" />
		</Suspense>
	);
}
