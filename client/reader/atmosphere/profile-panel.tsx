import { useConnectionQuery } from '@automattic/api-queries';
import { AuthorProfilePanel } from './author-profile-panel';
import { useOptionalComposer } from './composer';
import { TimelineComposePill } from './composer/triggers/timeline-compose-pill';
import type { AtmosphereConnection } from '@automattic/api-core';

interface ProfilePanelProps {
	connection: AtmosphereConnection;
}

export function ProfilePanel( { connection }: ProfilePanelProps ) {
	const composer = useOptionalComposer();
	const { data } = useConnectionQuery( connection.id );

	return (
		<>
			{ composer && data && (
				<TimelineComposePill
					connection={ connection }
					avatar={ data.avatar }
					entryPoint="profile_inline"
				/>
			) }
			<AuthorProfilePanel
				connection={ connection }
				actor={ connection.handle }
				subtabBasePath={ `/reader/atmosphere/${ connection.id }/profile` }
			/>
		</>
	);
}

export default ProfilePanel;
