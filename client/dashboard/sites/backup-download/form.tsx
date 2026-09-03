import { siteBackupDownloadInitiateMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import type { DownloadConfig } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

const fields: Field< DownloadConfig >[] = [
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
		description: __( 'Includes wp-config.php and any non WordPress files.' ),
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

function SiteBackupDownloadForm( {
	siteId,
	rewindId,
	downloadPointDate,
	onDownloadInitiate,
}: {
	siteId: number;
	rewindId: string;
	downloadPointDate: string;
	onDownloadInitiate: ( downloadId: number ) => void;
} ) {
	const { mutate: downloadMutation, isPending: isDownloadMutationPending } = useMutation(
		siteBackupDownloadInitiateMutation( siteId )
	);
	const { createErrorNotice } = useDispatch( noticesStore );

	const [ formData, setFormData ] = useState< DownloadConfig >( {
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

	const handleFormChange = ( changes: Partial< DownloadConfig > ) => {
		setFormData( ( data ) => ( { ...data, ...changes } ) );
	};

	const handleDownload = () => {
		downloadMutation(
			{
				timestamp: rewindId,
				config: formData,
			},
			{
				onSuccess: ( downloadId ) => {
					onDownloadInitiate( downloadId );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to initiate download. Please try again.' ), {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		handleDownload();
	};

	const isFormValid = Object.values( formData ).some( ( value ) => value );

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				<p>
					{ createInterpolateElement(
						__( 'Choose what to download from your <downloadPointDate /> backup:' ),
						{ downloadPointDate: <strong>{ downloadPointDate }</strong> }
					) }
				</p>
				<DataForm< DownloadConfig >
					data={ formData }
					fields={ fields }
					form={ form }
					onChange={ handleFormChange }
				/>

				<ButtonStack justify="flex-start">
					<Button
						variant="primary"
						type="submit"
						isBusy={ isDownloadMutationPending }
						disabled={ ! isFormValid || isDownloadMutationPending }
					>
						{ __( 'Generate download' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</form>
	);
}

export default SiteBackupDownloadForm;
