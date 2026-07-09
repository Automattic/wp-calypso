import { siteGranularBackupDownloadInitiateMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalGrid as Grid,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, _n, sprintf } from '@wordpress/i18n';
import { useCallback } from 'react';
import FileBrowser from '../../../my-sites/backup/backup-contents-page/file-browser';
import { useFileBrowserContext } from '../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context';
import { useAnalytics } from '../../app/analytics';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody, CardHeader } from '../../components/card';
import { useFormattedTime } from '../../components/formatted-time';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';
import { ImagePreview } from './image-preview';
import type { ActivityLogEntry, Site } from '@automattic/api-core';

interface BackupDetailsProps {
	backup: ActivityLogEntry;
	site: Site;
	timezoneString?: string;
	gmtOffset?: number;
	onRequestRestore?: () => void;
	onRequestDownload?: () => void;
	onGranularDownloadReady?: ( downloadId: number ) => void;
}

export function BackupDetails( {
	backup,
	site,
	timezoneString,
	gmtOffset,
	onRequestRestore,
	onRequestDownload,
	onGranularDownloadReady,
}: BackupDetailsProps ) {
	const { recordTracksEvent } = useAnalytics();
	const publishedTimestamp = backup.published || backup.last_published;
	const formattedTime = useFormattedTime(
		publishedTimestamp,
		{
			dateStyle: 'medium',
			timeStyle: 'short',
		},
		timezoneString,
		gmtOffset
	);
	const { fileBrowserState } = useFileBrowserContext();
	const { totalItems: selectedFilesCount } = fileBrowserState.getCheckList(
		Number( backup.rewind_id )
	);

	// Granular backup download mutation
	const { mutate: granularDownloadMutate, isPending: isGranularDownloadPending } = useMutation(
		siteGranularBackupDownloadInitiateMutation( site.ID )
	);

	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const direction = isSmallViewport ? 'column-reverse' : 'row';

	const handleGranularDownloadClick = useCallback( () => {
		const browserCheckList = fileBrowserState.getCheckList( Number( backup.rewind_id ) );
		const includePaths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
		const excludePaths = browserCheckList.excludeList.map( ( item ) => item.id ).join( ',' );

		recordTracksEvent( 'calypso_dashboard_backup_granular_download_request' );

		granularDownloadMutate(
			{
				rewindId: backup.rewind_id,
				includePaths,
				excludePaths,
			},
			{
				onSuccess: ( downloadId ) => {
					onGranularDownloadReady?.( downloadId );
				},
			}
		);
	}, [
		fileBrowserState,
		recordTracksEvent,
		granularDownloadMutate,
		backup.rewind_id,
		onGranularDownloadReady,
	] );

	const hasSelectedFiles = selectedFilesCount > 0;
	const showActions = !! ( onRequestRestore || onRequestDownload );
	const actions =
		showActions && backup.rewind_id ? (
			<ButtonStack alignment="stretch" justify="center" direction={ direction }>
				<Button
					variant="tertiary"
					size={ isSmallViewport ? 'default' : 'compact' }
					onClick={ hasSelectedFiles ? handleGranularDownloadClick : onRequestDownload }
					style={ { justifyContent: 'center' } }
					disabled={ isGranularDownloadPending }
					isBusy={ isGranularDownloadPending }
				>
					{ hasSelectedFiles
						? _n( 'Download selected file', 'Download selected files', selectedFilesCount )
						: __( 'Download backup' ) }
				</Button>
				<Button
					variant="primary"
					size={ isSmallViewport ? 'default' : 'compact' }
					onClick={ onRequestRestore }
					style={ { justifyContent: 'center' } }
				>
					{ hasSelectedFiles
						? _n( 'Restore selected file', 'Restore selected files', selectedFilesCount )
						: __( 'Restore to this point' ) }
				</Button>
			</ButtonStack>
		) : null;

	return (
		<Card>
			<CardHeader style={ { flexDirection: 'column', alignItems: 'stretch' } }>
				<SectionHeader title={ backup.summary } actions={ ! isSmallViewport ? actions : null } />
				{ isSmallViewport ? actions : null }
			</CardHeader>
			<CardBody style={ { minHeight: '300px' } }>
				<VStack>
					<Text size={ 14 } weight={ 500 }>
						{ backup.content.text }
					</Text>
					<HStack alignment="left" spacing={ 1 }>
						<Text variant="muted">{ formattedTime }</Text>
						{ backup.actor?.name && (
							<Text variant="muted">
								{
									/* translators: %s is the name of the person/system who performed the backup */
									sprintf( __( 'by %s' ), backup.actor.name )
								}
							</Text>
						) }
					</HStack>
					<Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))">
						{ backup.streams ? (
							backup.streams.map( ( item, index ) => (
								<ImagePreview key={ index } item={ item } multipleImages />
							) )
						) : (
							<ImagePreview item={ backup } />
						) }
					</Grid>
					{ !! backup.object?.backup_period && (
						<div className="backup-details__file-browser">
							<FileBrowser
								key={ backup.rewind_id }
								rewindId={ Number( backup.rewind_id ) }
								siteId={ site.ID }
								siteSlug={ site.slug }
								isRestoreEnabled={ !! onRequestRestore }
								onTrackEvent={ recordTracksEvent }
								source="dashboard"
								onRequestGranularRestore={ onRequestRestore }
							/>
						</div>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
