import { useConnectionQuery } from '@automattic/api-queries';
import { VerifyPanel } from './verify-panel';
import type { AtmosphereConnection } from '@automattic/api-core';

interface ProfilePanelProps {
	connection: AtmosphereConnection;
}

export function ProfilePanel( { connection }: ProfilePanelProps ) {
	const verify = useConnectionQuery( connection.id );
	return (
		<VerifyPanel
			data={ verify.data ?? null }
			error={ verify.error ?? null }
			isLoading={ verify.isFetching }
		/>
	);
}
