import {
	activeAgencyQuery,
	mcpSettingsQuery,
	agencyMcpSettingsMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../../app/analytics';
import Breadcrumbs from '../../../app/breadcrumbs';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import McpAvailableTools from './available-tools-content';
import type { McpSettingsUpdate } from '@automattic/api-core';

export default function McpAvailableToolsScreen() {
	const { recordTracksEvent } = useAnalytics();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const { data: settings } = useQuery( mcpSettingsQuery( agencyId ) );
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
		<PageLayout
			header={
				<PageHeader title={ __( 'Available tools' ) } prefix={ <Breadcrumbs length={ 2 } /> } />
			}
		>
			<McpAvailableTools
				settings={ settings }
				onSave={ onSave }
				recordTracksEvent={ recordTracksEvent }
			/>
		</PageLayout>
	);
}
