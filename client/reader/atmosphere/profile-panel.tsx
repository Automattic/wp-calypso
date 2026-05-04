import { AuthorProfilePanel } from './author-profile-panel';
import type { AtmosphereConnection } from '@automattic/api-core';

interface ProfilePanelProps {
	connection: AtmosphereConnection;
}

export function ProfilePanel( { connection }: ProfilePanelProps ) {
	return (
		<AuthorProfilePanel
			connection={ connection }
			actor={ connection.handle }
			subtabBasePath={ `/reader/atmosphere/${ connection.id }/profile` }
		/>
	);
}

export default ProfilePanel;
