/* global agentsManagerData */
import './config';
import AgentsManager from '@automattic/agents-manager';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function getCurrentSiteId() {
	const siteId =
		agentsManagerData.site?.ID ??
		agentsManagerData.siteId ??
		window.JP_CONNECTION_INITIAL_STATE?.userConnectionData?.currentUser?.blogId ??
		window.Jetpack_Editor_Initial_State?.wpcomBlogId;
	const numericSiteId = Number( siteId );

	return Number.isFinite( numericSiteId ) && numericSiteId > 0 ? numericSiteId : undefined;
}

export default function AgentsManagerWithProvider( { useImageUpload } ) {
	const currentSiteId = getCurrentSiteId();

	return (
		<QueryClientProvider client={ queryClient }>
			<AgentsManager
				sectionName={ agentsManagerData.sectionName || 'wp-admin' }
				currentUser={ agentsManagerData.currentUser }
				site={ agentsManagerData.site }
				currentSiteId={ currentSiteId }
				useImageUpload={ useImageUpload }
			/>
		</QueryClientProvider>
	);
}
