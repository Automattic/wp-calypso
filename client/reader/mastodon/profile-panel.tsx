import { useMastodonConnectionQuery } from '@automattic/api-queries';
import { VerifyPanel } from './verify-panel';
import type { MastodonConnection } from '@automattic/api-core';

interface ProfilePanelProps {
	connection: MastodonConnection;
}

export function ProfilePanel( { connection }: ProfilePanelProps ) {
	const verify = useMastodonConnectionQuery( connection.id );
	return (
		<VerifyPanel
			data={ verify.data ?? null }
			error={ verify.error ?? null }
			isLoading={ verify.isLoading }
		/>
	);
}
