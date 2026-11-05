import { archiveAmplifyReportMutation, retryAmplifyReportMutation } from '@automattic/api-queries';
import { useIsMutating, useMutation } from '@tanstack/react-query';
import {
	Button,
	ExternalLink,
	Modal,
	VisuallyHidden,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { box as archiveBoxIcon } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { Badge } from '@wordpress/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useIntlLocale } from '../../app/locale';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../components/button-stack';
import { DataViews, DataViewsCard, DataViewsEmptyStateLayout } from '../../components/dataviews';
import { Text } from '../../components/text';
import SiteScreenshot from '../components/site-screenshot';
import { Preview } from '../sites/dataviews/site';
import { useDownloadReportPdf } from './use-download-report-pdf';
import type { AmplifyReport } from '@automattic/api-core';
import type { Field, SupportedLayouts, View } from '@wordpress/dataviews';

const REPORT_LAYOUTS: SupportedLayouts = {
	table: {
		layout: {
			density: 'balanced',
			styles: { actions: { align: 'end' } },
		},
		showMedia: true,
		mediaField: 'icon',
		titleField: 'site',
		descriptionField: 'url',
	},
	grid: {
		layout: { previewSize: 290 },
		showMedia: true,
		mediaField: 'preview',
		titleField: 'site',
		descriptionField: 'url',
	},
};

const DEFAULT_VIEW: View = {
	type: 'table',
	page: 1,
	perPage: 12,
	showMedia: true,
	mediaField: 'icon',
	titleField: 'site',
	descriptionField: 'url',
	layout: { density: 'balanced', styles: { actions: { align: 'end' } } },
	fields: [ 'humanScore', 'aiScore', 'actions' ],
	filters: [],
	sort: { field: 'created', direction: 'desc' },
};

function getStatusLabels(): Record< AmplifyReport[ 'status' ], string > {
	return {
		pending: __( 'Waiting to start' ),
		in_progress: __( 'In progress' ),
		completed: __( 'Ready' ),
		failed: __( 'Failed' ),
	};
}

function formatCreated( value: string, locale: string ) {
	const date = new Date( value );
	const age = Date.now() - date.getTime();
	if ( age >= 0 && age < 7 * 24 * 60 * 60 * 1000 ) {
		const relative = new Intl.RelativeTimeFormat( locale, { numeric: 'auto' } );
		if ( age < 60 * 60 * 1000 ) {
			return relative.format( -Math.floor( age / ( 60 * 1000 ) ), 'minute' );
		}
		if ( age < 24 * 60 * 60 * 1000 ) {
			return relative.format( -Math.floor( age / ( 60 * 60 * 1000 ) ), 'hour' );
		}
		return relative.format( -Math.floor( age / ( 24 * 60 * 60 * 1000 ) ), 'day' );
	}
	return new Intl.DateTimeFormat( locale, { dateStyle: 'medium' } ).format( date );
}

/** Failed rows leave the score cells empty so the failure reason can run across them. */
function Score( { score, isEmpty = false }: { score: number | null; isEmpty?: boolean } ) {
	if ( isEmpty ) {
		return null;
	}
	if ( score === null ) {
		return <Text variant="muted">—</Text>;
	}
	let intent: 'stable' | 'medium' | 'high' = 'high';
	if ( score >= 80 ) {
		intent = 'stable';
	} else if ( score >= 50 ) {
		intent = 'medium';
	}
	return (
		<Badge intent={ intent }>
			{ sprintf(
				/* translators: %d: score out of 100 */
				__( '%d/100' ),
				score
			) }
		</Badge>
	);
}

function titleFor( report: AmplifyReport ) {
	return report.site_title || displayUrl( report.url );
}

function displayUrl( value: string ) {
	return value.replace( /^https?:\/\//, '' ).replace( /\/$/, '' );
}

function ArchiveReportModal( {
	agencyId,
	report,
	closeModal,
	onArchived,
}: {
	agencyId: number;
	report: AmplifyReport;
	closeModal?: () => void;
	onArchived?: () => void;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const archive = useMutation(
		withSnackbar( archiveAmplifyReportMutation( agencyId ), {
			success: __( 'The report has been archived.' ),
			error: __( 'Failed to archive the report.' ),
		} )
	);
	return (
		<VStack spacing={ 6 }>
			<Text>
				{ sprintf(
					/* translators: %s: website URL */
					__( 'Archive the report for %s? It will disappear from this list.' ),
					displayUrl( report.url )
				) }
			</Text>
			<ButtonStack justify="flex-end">
				<Button
					__next40pxDefaultSize
					variant="tertiary"
					disabled={ archive.isPending }
					accessibleWhenDisabled
					onClick={ closeModal }
				>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					__next40pxDefaultSize
					variant="primary"
					isDestructive
					isBusy={ archive.isPending }
					disabled={ archive.isPending }
					onClick={ () => {
						recordTracksEvent( 'calypso_a4a_amplify_report_archive_confirm', {
							report_id: report.id,
							mode: report.mode,
						} );
						archive.mutate( report.id, { onSuccess: () => onArchived?.() } );
					} }
				>
					{ __( 'Archive' ) }
				</Button>
			</ButtonStack>
		</VStack>
	);
}

export default function AmplifyReportsList( {
	agencyId,
	reports,
	isLoading = false,
}: {
	agencyId: number;
	reports: AmplifyReport[];
	isLoading?: boolean;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const locale = useIntlLocale();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );
	const [ reportToArchive, setReportToArchive ] = useState< AmplifyReport | null >( null );
	const reportsRef = useRef< HTMLDivElement >( null );
	const [ focusAfterArchive, setFocusAfterArchive ] = useState( false );
	// The archived row is gone, so focus moves to the table's search instead of the page body.
	// This runs after the modal has unmounted and returned focus.
	useEffect( () => {
		if ( focusAfterArchive && ! reportToArchive ) {
			reportsRef.current?.querySelector< HTMLElement >( 'input[type="search"]' )?.focus();
			setFocusAfterArchive( false );
		}
	}, [ focusAfterArchive, reportToArchive ] );
	const isArchiving =
		useIsMutating( { mutationKey: archiveAmplifyReportMutation( agencyId ).mutationKey } ) > 0;
	const {
		mutate: retryReport,
		isPending: isRetryPending,
		variables: retryVariables,
	} = useMutation( retryAmplifyReportMutation( agencyId ) );
	const retryingId = isRetryPending ? retryVariables : null;
	const { downloadReportPdf, downloadingId } = useDownloadReportPdf( agencyId );
	const onDownload = useCallback(
		( item: AmplifyReport ) => {
			recordTracksEvent( 'calypso_a4a_amplify_report_download_click', {
				report_id: item.id,
				mode: item.mode,
			} );
			downloadReportPdf( item.id ).catch( () =>
				createErrorNotice( __( 'Failed to download the report.' ), {
					type: 'snackbar',
				} )
			);
		},
		[ createErrorNotice, downloadReportPdf, recordTracksEvent ]
	);
	const onRetry = useCallback(
		( item: AmplifyReport ) => {
			recordTracksEvent( 'calypso_a4a_amplify_report_retry_click', {
				report_id: item.id,
				mode: item.mode,
			} );
			retryReport( item.id, {
				onSuccess: () =>
					createSuccessNotice(
						__( 'Report restarted. Retries don’t count toward your allowance.' ),
						{ type: 'snackbar' }
					),
				onError: ( error ) =>
					createErrorNotice(
						( error as { code?: string } )?.code === 'amplify_report_retry_limit_reached'
							? __( 'This report was already retried. Start a new report instead.' )
							: __( 'Failed to restart the report.' ),
						{ type: 'snackbar' }
					),
			} );
		},
		[ createErrorNotice, createSuccessNotice, recordTracksEvent, retryReport ]
	);

	const fields = useMemo< Field< AmplifyReport >[] >(
		() => [
			{
				id: 'icon',
				label: __( 'Site preview' ),
				render: ( { item } ) => (
					<SiteScreenshot
						key={ item.url }
						url={ item.url }
						alt=""
						compact
						decorative
						width={ 60 }
						height={ 48 }
					/>
				),
				enableSorting: false,
			},
			{
				id: 'preview',
				label: __( 'Preview' ),
				render: ( { item } ) => <Preview url={ item.url } />,
				enableSorting: false,
				enableHiding: false,
			},
			{
				id: 'site',
				label: __( 'Site' ),
				getValue: ( { item } ) => titleFor( item ),
				enableGlobalSearch: true,
				enableHiding: false,
			},
			{
				id: 'url',
				label: __( 'URL' ),
				getValue: ( { item } ) => displayUrl( item.url ),
				render: ( { item } ) => (
					<VStack spacing={ 0 }>
						<ExternalLink className="dataviews-url-field" href={ item.url }>
							{ displayUrl( item.url ) }
						</ExternalLink>
						{ item.status === 'failed' && (
							<Text intent="error" size={ 12 }>
								{ item.failure_reason || __( 'The report didn’t finish.' ) }
							</Text>
						) }
					</VStack>
				),
				enableGlobalSearch: true,
			},
			{
				id: 'status',
				label: __( 'Status' ),
				getValue: ( { item } ) => item.status,
				elements: Object.entries( getStatusLabels() ).map( ( [ value, label ] ) => ( {
					value,
					label,
				} ) ),
				filterBy: { operators: [ 'isAny' ] },
				render: ( { item } ) => <Text>{ getStatusLabels()[ item.status ] }</Text>,
			},
			{
				id: 'mode',
				label: __( 'Report type' ),
				getValue: ( { item } ) => item.mode,
				elements: [
					{ value: 'full', label: __( 'Full report' ) },
					{ value: 'human', label: __( 'People' ) },
					{ value: 'ai', label: __( 'AI agents' ) },
				],
				filterBy: { operators: [ 'isAny' ] },
			},
			{
				id: 'humanScore',
				label: __( 'People' ),
				type: 'integer',
				getValue: ( { item } ) => item.score.human ?? -1,
				render: ( { item } ) => (
					<Score
						score={ item.status === 'completed' ? item.score.human : null }
						isEmpty={ item.status === 'failed' }
					/>
				),
				filterBy: false,
			},
			{
				id: 'aiScore',
				label: __( 'AI agents' ),
				type: 'integer',
				getValue: ( { item } ) => item.score.ai ?? -1,
				render: ( { item } ) => (
					<Score
						score={ item.status === 'completed' ? item.score.ai : null }
						isEmpty={ item.status === 'failed' }
					/>
				),
				filterBy: false,
			},
			{
				id: 'created',
				label: __( 'Created' ),
				type: 'datetime',
				getValue: ( { item } ) => item.created_at ?? '',
				render: ( { item } ) =>
					item.created_at ? (
						<time
							dateTime={ item.created_at }
							title={ new Intl.DateTimeFormat( locale, {
								dateStyle: 'long',
								timeStyle: 'short',
							} ).format( new Date( item.created_at ) ) }
						>
							{ formatCreated( item.created_at, locale ) }
						</time>
					) : (
						'—'
					),
				filterBy: false,
			},
			{
				id: 'actions',
				label: __( 'Actions' ),
				header: <VisuallyHidden>{ __( 'Actions' ) }</VisuallyHidden>,
				render: ( { item } ) => (
					<HStack spacing={ 2 } justify="flex-end" expanded={ false }>
						{ item.status === 'completed' && (
							<Button
								__next40pxDefaultSize
								variant="secondary"
								size="compact"
								isBusy={ downloadingId === item.id }
								disabled={ ! item.has_pdf || downloadingId === item.id }
								accessibleWhenDisabled
								aria-label={ sprintf(
									/* translators: %s: name or address of the site the report is for */
									__( 'Download PDF for %s' ),
									titleFor( item )
								) }
								onClick={ () => onDownload( item ) }
							>
								{ __( 'Download PDF' ) }
							</Button>
						) }
						{ item.status === 'failed' && (
							<Button
								__next40pxDefaultSize
								variant="secondary"
								size="compact"
								isBusy={ retryingId === item.id }
								disabled={ !! retryingId }
								accessibleWhenDisabled
								aria-label={ sprintf(
									/* translators: %s: name or address of the site the report is for */
									__( 'Retry report for %s' ),
									titleFor( item )
								) }
								onClick={ () => onRetry( item ) }
							>
								{ __( 'Retry' ) }
							</Button>
						) }
						{ ( item.status === 'pending' || item.status === 'in_progress' ) && (
							<Text variant="muted">{ getStatusLabels()[ item.status ] }</Text>
						) }
						<Button
							__next40pxDefaultSize
							size="compact"
							icon={ archiveBoxIcon }
							label={ __( 'Archive report' ) }
							aria-label={ sprintf(
								/* translators: %s: name or address of the site the report is for */
								__( 'Archive report for %s' ),
								titleFor( item )
							) }
							showTooltip
							onClick={ () => {
								recordTracksEvent( 'calypso_a4a_amplify_report_archive_click', {
									report_id: item.id,
									mode: item.mode,
								} );
								setReportToArchive( item );
							} }
						/>
					</HStack>
				),
				enableSorting: false,
				enableHiding: false,
				filterBy: false,
			},
		],
		[ downloadingId, locale, onDownload, onRetry, recordTracksEvent, retryingId ]
	);

	const { data: visibleReports, paginationInfo } = filterSortAndPaginate( reports, view, fields );
	const isFiltered = !! view.search || !! view.filters?.length;

	return (
		<>
			<DataViewsCard ref={ reportsRef } className="dashboard-amplify-reports">
				<DataViews< AmplifyReport >
					data={ visibleReports }
					fields={ fields }
					view={ view }
					onChangeView={ setView }
					isLoading={ isLoading }
					paginationInfo={ paginationInfo }
					getItemId={ ( item ) => item.id }
					defaultLayouts={ REPORT_LAYOUTS }
					empty={
						<DataViewsEmptyStateLayout
							title={ isFiltered ? __( 'No matching reports' ) : __( 'No reports yet' ) }
							description={
								isFiltered ? __( 'Try another search.' ) : __( 'Audits you run will appear here.' )
							}
							isBorderless
						/>
					}
				/>
			</DataViewsCard>
			{ reportToArchive && (
				<Modal
					title={ __( 'Archive report?' ) }
					isDismissible={ ! isArchiving }
					shouldCloseOnEsc={ ! isArchiving }
					shouldCloseOnClickOutside={ ! isArchiving }
					onRequestClose={ () => setReportToArchive( null ) }
				>
					<ArchiveReportModal
						agencyId={ agencyId }
						report={ reportToArchive }
						closeModal={ () => setReportToArchive( null ) }
						onArchived={ () => {
							setReportToArchive( null );
							setFocusAfterArchive( true );
						} }
					/>
				</Modal>
			) }
		</>
	);
}
