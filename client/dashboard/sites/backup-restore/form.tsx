import { siteBackupRestoreInitiateMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback, useId, useState } from 'react';
import { ButtonStack } from '../../components/button-stack';
import Notice from '../../components/notice';
import { Text } from '../../components/text';
import KnownThreatsNotice from '../backups/known-threats/known-threats-notice';
import { useRestoreInsteadFocusRef } from '../backups/known-threats/restore-that-one-instead-link';
import WooSubscriptionsNotice from './woo-subscriptions-notice';
import type { RestoreTrackingProps } from './types';
import type { RestoreConfig, Site } from '@automattic/api-core';
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
	site,
	restoreLinkTo,
	siteId,
	rewindId,
	restorePointDate,
	onRestoreInitiate,
}: {
	site: Site;
	restoreLinkTo?: string;
	siteId: number;
	rewindId: string;
	restorePointDate: string;
	onRestoreInitiate: ( restoreId: number, trackingProps?: RestoreTrackingProps ) => void;
} ) {
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

	const [ hasKnownThreats, setHasKnownThreats ] = useState( false );
	const [ acknowledged, setAcknowledged ] = useState( false );
	const handleKnownThreatsChange = useCallback( ( value: boolean ) => {
		setHasKnownThreats( value );
		if ( ! value ) {
			setAcknowledged( false );
		}
	}, [] );

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
					onRestoreInitiate( restoreId, {
						known_threats_shown: hasKnownThreats,
						known_threats_acknowledged: hasKnownThreats && acknowledged,
					} );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to initiate restore. Please try again.' ), {
						type: 'snackbar',
					} );
				},
			}
		);
	};

	const isFormValid = Object.values( formData ).some( ( value ) => value );
	const awaitingAcknowledgement = hasKnownThreats && ! acknowledged;
	const isRestoreDisabled = ! isFormValid || isRestoreMutationPending || awaitingAcknowledgement;
	const acknowledgementHintId = useId();
	const acknowledgementHint = __(
		'To restore this backup, confirm that you understand it contains known threats.'
	);

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( isRestoreDisabled ) {
			return;
		}
		handleRestore();
	};

	// Opened from "Restore … backup instead": land on the line naming the backup now being restored.
	const restorePointRef = useRestoreInsteadFocusRef( rewindId );

	const restoreWarning = formData.sqls
		? __(
				'This action will replace all settings, posts, pages and other site content with the information from the selected restore point.'
			)
		: __(
				'This action will replace the selected content with the content from the selected restore point.'
			);

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				<p ref={ restorePointRef } tabIndex={ -1 }>
					{ createInterpolateElement(
						__( 'Choose what to restore from your <restorePointDate /> backup:' ),
						{ restorePointDate: <strong>{ restorePointDate }</strong> }
					) }
				</p>
				<DataForm< RestoreConfig >
					data={ formData }
					fields={ fields }
					form={ form }
					onChange={ handleFormChange }
				/>

				<Notice variant="info" title={ __( 'Important' ) }>
					{ restoreWarning }
				</Notice>

				<WooSubscriptionsNotice
					siteId={ siteId }
					rewindId={ rewindId }
					includesDatabase={ !! formData.sqls }
				/>

				<KnownThreatsNotice
					site={ site }
					restoreLinkTo={ restoreLinkTo }
					rewindId={ rewindId }
					requireAcknowledgement
					acknowledged={ acknowledged }
					onAcknowledgedChange={ setAcknowledged }
					onKnownThreatsChange={ handleKnownThreatsChange }
				/>

				<ButtonStack justify="flex-start">
					{ /* The reason shows beside the button, which also takes it as its description. */ }
					<Button
						variant="primary"
						type="submit"
						isBusy={ isRestoreMutationPending }
						disabled={ isRestoreDisabled }
						accessibleWhenDisabled={ awaitingAcknowledgement }
						aria-describedby={ awaitingAcknowledgement ? acknowledgementHintId : undefined }
					>
						{ __( 'Restore now' ) }
					</Button>
					{ awaitingAcknowledgement && (
						<Text variant="muted" id={ acknowledgementHintId }>
							{ acknowledgementHint }
						</Text>
					) }
				</ButtonStack>
			</VStack>
		</form>
	);
}

export default SiteBackupRestoreForm;
