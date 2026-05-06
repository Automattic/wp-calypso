import { useConnectionQuery } from '@automattic/api-queries';
import { TimelineComposePill, useOptionalComposer } from 'calypso/reader/social/composer';
import { AuthorProfilePanel } from './author-profile-panel';
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
					avatar={ data.avatar ?? connection.avatar }
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
