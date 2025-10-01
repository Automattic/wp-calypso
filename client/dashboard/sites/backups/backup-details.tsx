import { siteGranularBackupDownloadInitiateMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalGrid as Grid,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
	CardHeader,
	Icon,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __, _n, sprintf } from '@wordpress/i18n';
import { rotateLeft, download } from '@wordpress/icons';
import { useCallback } from 'react';
import FileBrowser from '../../../my-sites/backup/backup-contents-page/file-browser';
import { useFileBrowserContext } from '../../../my-sites/backup/backup-contents-page/file-browser/file-browser-context';
import { useAnalytics } from '../../app/analytics';
import { siteBackupRestoreRoute, siteBackupDownloadRoute } from '../../app/router/sites';
import { ButtonStack } from '../../components/button-stack';
import { useFormattedTime } from '../../components/formatted-time';
import { SectionHeader } from '../../components/section-header';
import { Text } from '../../components/text';
import { gridiconToWordPressIcon } from '../../utils/gridicons';
import { ImagePreview } from './image-preview';
import type { ActivityLogEntry, Site } from '@automattic/api-core';

interface BackupDetailsProps {
	backup: ActivityLogEntry;
	site: Site;
	timezoneString?: string;
	gmtOffset?: number;
}

export function BackupDetails( { backup, site, timezoneString, gmtOffset }: BackupDetailsProps ) {
	const router = useRouter();
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
	const granularDownloadRequest = useMutation(
		siteGranularBackupDownloadInitiateMutation( site.ID )
	);

	const isSmallViewport = useViewportMatch( 'medium', '<' );
	const direction = isSmallViewport ? 'column-reverse' : 'row';

	const handleRestoreClick = () => {
		router.navigate( {
			to: siteBackupRestoreRoute.fullPath,
			params: { siteSlug: site.slug, rewindId: backup.rewind_id },
		} );
	};

	const handleDownloadClick = useCallback( () => {
		router.navigate( {
			to: siteBackupDownloadRoute.fullPath,
			params: { siteSlug: site.slug, rewindId: backup.rewind_id },
		} );
	}, [ router, site.slug, backup.rewind_id ] );

	const handleGranularDownloadClick = useCallback( () => {
		const browserCheckList = fileBrowserState.getCheckList( Number( backup.rewind_id ) );
		const includePaths = browserCheckList.includeList.map( ( item ) => item.id ).join( ',' );
		const excludePaths = browserCheckList.excludeList.map( ( item ) => item.id ).join( ',' );

		recordTracksEvent( 'calypso_dashboard_backup_granular_download_request' );

		granularDownloadRequest.mutate(
			{
				rewindId: backup.rewind_id,
				includePaths,
				excludePaths,
			},
			{
				onSuccess: ( downloadId ) => {
					// Navigate to download page with the downloadId to skip the form
					router.navigate( {
						to: siteBackupDownloadRoute.fullPath,
						params: { siteSlug: site.slug, rewindId: backup.rewind_id },
						search: { downloadId },
					} );
				},
			}
		);
	}, [
		fileBrowserState,
		recordTracksEvent,
		granularDownloadRequest,
		backup.rewind_id,
		router,
		site.slug,
	] );

	const hasSelectedFiles = selectedFilesCount > 0;
	const actions = backup.rewind_id ? (
		<ButtonStack alignment="stretch" justify="center" direction={ direction }>
			<Button
				variant="tertiary"
				size={ isSmallViewport ? 'default' : 'compact' }
				icon={ download }
				onClick={ hasSelectedFiles ? handleGranularDownloadClick : handleDownloadClick }
				style={ { justifyContent: 'center' } }
				disabled={ granularDownloadRequest.isPending }
				isBusy={ granularDownloadRequest.isPending }
			>
				{ hasSelectedFiles
					? _n( 'Download selected file', 'Download selected files', selectedFilesCount )
					: __( 'Download backup' ) }
			</Button>
			<Button
				variant="primary"
				size={ isSmallViewport ? 'default' : 'compact' }
				icon={ rotateLeft }
				onClick={ handleRestoreClick }
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
				<SectionHeader
					title={ backup.summary }
					decoration={ <Icon icon={ gridiconToWordPressIcon( backup.gridicon ) } /> }
					actions={ ! isSmallViewport ? actions : null }
				/>
				{ isSmallViewport ? actions : null }
			</CardHeader>
			<CardBody>
				<VStack>
					<Text size={ 14 } weight={ 500 }>
						{ backup.content.text }
					</Text>
					<HStack alignment="left" spacing={ 4 }>
						<Text variant="muted">{ formattedTime }</Text>
						{ backup.actor?.name && (
							<Text variant="muted">
								{
									/* translators: %s is the name of the person/system who performed the backup */
									sprintf( __( 'By %s' ), backup.actor.name )
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
								isRestoreEnabled
								onTrackEvent={ recordTracksEvent }
								source="dashboard"
								onRequestGranularRestore={ handleRestoreClick }
							/>
						</div>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
