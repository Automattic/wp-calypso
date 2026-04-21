import ContentResearchSidebar from '@automattic/content-research';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PluginSidebar, PluginSidebarMoreMenuItem } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { search } from '@wordpress/icons';
import { registerPlugin } from '@wordpress/plugins';
import './content-research.scss';

const queryClient = new QueryClient();

function ContentResearchPlugin() {
	return (
		<>
			<PluginSidebarMoreMenuItem target="content-research-sidebar" icon={ search }>
				{ __( 'Content Research', 'content-research' ) }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar
				name="content-research-sidebar"
				title={ __( 'Content Research', 'content-research' ) }
				icon={ search }
			>
				<QueryClientProvider client={ queryClient }>
					<ContentResearchSidebar />
				</QueryClientProvider>
			</PluginSidebar>
		</>
	);
}

registerPlugin( 'content-research', {
	render: () => <ContentResearchPlugin />,
} );
