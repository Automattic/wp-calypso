import {
	activeAgencyQuery,
	mcpSettingsQuery,
	agencyMcpSettingsMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import McpOverview from './overview-content';
import type { McpSettingsUpdate } from '@automattic/api-core';

export default function Mcp() {
	const { recordTracksEvent } = useAnalytics();
	const navigate = useNavigate();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const { data: settings, isLoading } = useQuery( mcpSettingsQuery( agencyId ) );
	const mutation = useMutation( {
		...agencyMcpSettingsMutation( agencyId ),
		meta: {
			snackbar: {
				success: __( 'MCP settings saved.' ),
				error: __( 'Could not save. Please try again.' ),
			},
		},
	} );

	const onSave = ( update: McpSettingsUpdate ) => mutation.mutate( update );

	return (
		<PageLayout header={ <PageHeader title={ __( 'MCP' ) } /> }>
			<McpOverview
				settings={ settings }
				isLoading={ isLoading }
				isSaving={ mutation.isPending }
				onSave={ onSave }
				recordTracksEvent={ recordTracksEvent }
				onNavigate={ ( path ) => navigate( { to: path as '/resources/ai-mcp/tools' } ) }
			/>
		</PageLayout>
	);
}
