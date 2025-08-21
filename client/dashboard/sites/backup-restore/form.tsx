import { useMutation } from '@tanstack/react-query';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { rotateLeft } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { siteBackupRestoreInitiateMutation } from '../../app/queries/site-backup-restore';
import { siteBackupRestoreRoute } from '../../app/router/sites';
import Notice from '../../components/notice';
import type { RestoreConfig } from '../../data/site-backup-restore';
import type { Field } from '@wordpress/dataviews';

const fields: Field< RestoreConfig >[] = [
	{
		id: 'themes',
		label: __( 'WordPress themes' ),
		Edit: 'checkbox',
	},
	{
		id: 'plugins',
		label: __( 'WordPress plugins' ),
		Edit: 'checkbox',
	},
	{
		id: 'roots',
		label: __( 'WordPress root' ),
		description: __( 'Includes wp-config php and any non WordPress files.' ),
		Edit: 'checkbox',
	},
	{
		id: 'contents',
		label: __( 'WP-content directory' ),
		description: __( 'Excludes themes, plugins, and uploads.' ),
		Edit: 'checkbox',
	},
	{
		id: 'sqls',
		label: __( 'Site database' ),
		description: __( 'Includes pages, and posts.' ),
		Edit: 'checkbox',
	},
	{
		id: 'uploads',
		label: __( 'Media uploads' ),
		description: __( 'You must also select Site database for restored media uploads to appear.' ),
		Edit: 'checkbox',
	},
];

function SiteBackupRestoreForm( {
	siteId,
	onRestoreInitiate,
}: {
	siteId: number;
	onRestoreInitiate: ( restoreId: number ) => void;
} ) {
	const { rewindId } = siteBackupRestoreRoute.useParams();
	const { mutate: restoreMutation, isPending: isRestoreMutationPending } = useMutation(
		siteBackupRestoreInitiateMutation( siteId )
	);
	const { createErrorNotice } = useDispatch( noticesStore );

	const [ formData, setFormData ] = useState< RestoreConfig >( {
		themes: true,
		plugins: true,
		roots: true,
		contents: true,
		sqls: true,
		uploads: true,
	} );

	const form = {
		type: 'regular' as const,
		fields: [ 'themes', 'plugins', 'roots', 'contents', 'sqls', 'uploads' ],
	};

	const handleFormChange = ( changes: Partial< RestoreConfig > ) => {
		setFormData( ( data ) => ( { ...data, ...changes } ) );
	};

	const handleRestore = () => {
		restoreMutation(
			{
				timestamp: rewindId,
				config: formData,
			},
			{
				onSuccess: ( restoreId ) => {
					onRestoreInitiate( restoreId );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to initiate restore. Please try again.' ), {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	const restoreWarning = formData.sqls
		? __(
				'This action will replace all settings, posts, pages and other site content with the information from the selected restore point.'
		  )
		: __(
				'This action will replace the selected content with the content from the selected restore point.'
		  );

	const isFormValid = Object.values( formData ).some( ( value ) => value );

	return (
		<>
			<p>{ __( 'Choose the items you wish to restore:' ) }</p>
			<DataForm< RestoreConfig >
				data={ formData }
				fields={ fields }
				form={ form }
				onChange={ handleFormChange }
			/>

			<Notice variant="info" title={ __( 'Important' ) }>
				{ restoreWarning }
			</Notice>

			<HStack justify="flex-start">
				<Button
					variant="primary"
					icon={ rotateLeft }
					onClick={ handleRestore }
					isBusy={ isRestoreMutationPending }
					disabled={ ! isFormValid || isRestoreMutationPending }
				>
					{ __( 'Restore now' ) }
				</Button>
			</HStack>
		</>
	);
}

export default SiteBackupRestoreForm;
