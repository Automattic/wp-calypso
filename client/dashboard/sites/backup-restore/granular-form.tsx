import { siteBackupGranularRestoreMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { Button, Panel, __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useCallback, useId, useState } from 'react';
import { useFileBrowserContext } from '../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context';
import { ButtonStack } from '../../components/button-stack';
import Notice from '../../components/notice';
import { Text } from '../../components/text';
import KnownThreatsNotice from '../backups/known-threats/known-threats-notice';
import FileSectionPanelBody from './file-section-panel-body';
import WooSubscriptionsNotice from './woo-subscriptions-notice';
import type { RestoreTrackingProps } from './types';
import type { Site } from '@automattic/api-core';

function SiteBackupGranularRestoreForm( {
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
		siteBackupGranularRestoreMutation( siteId )
	);
	const { createErrorNotice } = useDispatch( noticesStore );

	const { fileBrowserState } = useFileBrowserContext();
	const browserCheckList = fileBrowserState.getCheckList( Number( rewindId ) );
	const browserSelectedList = fileBrowserState.getSelectedList( Number( rewindId ) );

	const [ hasKnownThreats, setHasKnownThreats ] = useState( false );
	const [ acknowledged, setAcknowledged ] = useState( false );
	const handleKnownThreatsChange = useCallback( ( value: boolean ) => {
		setHasKnownThreats( value );
		if ( ! value ) {
			setAcknowledged( false );
		}
	}, [] );

	const handleGranularRestore = () => {
		const includePaths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
		const excludePaths = browserCheckList.excludeList.map( ( item ) => item.id ).join( ',' );

		restoreMutation(
			{
				timestamp: rewindId,
				config: {
					includePaths,
					excludePaths,
				},
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

	const awaitingAcknowledgement = hasKnownThreats && ! acknowledged;
	const isRestoreDisabled = isRestoreMutationPending || awaitingAcknowledgement;
	const acknowledgementHintId = useId();
	const acknowledgementHint = __(
		'To restore this backup, confirm that you understand it contains known threats.'
	);

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( isRestoreDisabled ) {
			return;
		}
		handleGranularRestore();
	};

	const hasSelectedTables = browserSelectedList.some(
		( item ) =>
			item.type === 'table' ||
			// Also check if root path or /sql is selected as this includes all tables
			item.path === '/sql' ||
			item.path === '/'
	);

	const restoreWarning = hasSelectedTables
		? __(
				'This action will replace all settings, posts, pages and other site content with the information from the selected restore point.'
			)
		: __(
				'This action will replace the selected content with the content from the selected restore point.'
			);

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 4 }>
				<Text>
					{ createInterpolateElement(
						_n(
							'Restoring the following item from your <restorePointDate /> backup:',
							'Restoring the following items from your <restorePointDate /> backup:',
							browserCheckList.totalItems
						),
						{ restorePointDate: <strong>{ restorePointDate }</strong> }
					) }
				</Text>
				<Panel>
					<FileSectionPanelBody type="theme" selectedItems={ browserSelectedList } />
					<FileSectionPanelBody type="plugin" selectedItems={ browserSelectedList } />
					<FileSectionPanelBody type="table" selectedItems={ browserSelectedList } />
					<FileSectionPanelBody type="file" selectedItems={ browserSelectedList } />
				</Panel>

				<Notice variant="info" title={ __( 'Important' ) }>
					{ restoreWarning }
				</Notice>

				<WooSubscriptionsNotice
					siteId={ siteId }
					rewindId={ rewindId }
					includesDatabase={ hasSelectedTables }
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
						{ _n( 'Restore selected file', 'Restore selected files', browserCheckList.totalItems ) }
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

export default SiteBackupGranularRestoreForm;
