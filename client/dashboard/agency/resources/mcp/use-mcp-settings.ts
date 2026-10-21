import {
	activeAgencyQuery,
	mcpSettingsQuery,
	agencyMcpSettingsMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import { withSnackbar } from '../../../app/snackbars/with-snackbar';
import type { McpSettingsUpdate } from '@automattic/api-core';

export function useMcpSettings() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;
	const { data: settings, isLoading } = useQuery( mcpSettingsQuery( agencyId ) );
	const { mutate, isPending } = useMutation(
		withSnackbar( agencyMcpSettingsMutation( agencyId ), {
			success: __( 'MCP settings saved.' ),
			error: __( 'Could not save. Please try again.' ),
		} )
	);

	const save = useCallback( ( update: McpSettingsUpdate ) => mutate( update ), [ mutate ] );

	return { settings, isLoading, isSaving: isPending, save };
}
