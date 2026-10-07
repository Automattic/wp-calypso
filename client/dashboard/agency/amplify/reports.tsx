import {
	archiveAmplifyReportMutation,
	paginatedAgencySitesQuery,
	retryAmplifyReportMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button, Modal, __experimentalHStack as HStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataViews as WPDataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { box as archiveBoxIcon } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { Badge } from '@wordpress/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useIntlLocale } from '../../app/locale';
import { ButtonStack } from '../../components/button-stack';
import { DataViews, DataViewsCard, DataViewsEmptyStateLayout } from '../../components/dataviews';
import { Text } from '../../components/text';
import SiteScreenshot from './site-screenshot';
import type { AmplifyReport } from '@automattic/api-core';
import type { Field, SupportedLayouts, View } from '@wordpress/dataviews';

const TABLE_STYLES = {
	humanScore: { align: 'end' as const },
	aiScore: { align: 'end' as const },
	created: { align: 'end' as const },
	actions: { align: 'end' as const },
};

const REPORT_LAYOUTS: SupportedLayouts = {
	table: {
		titleField: 'site',
		mediaField: 'preview',
		showMedia: true,
		descriptionField: undefined,
		showDescription: false,
		layout: { aspectRatio: '16/9', styles: TABLE_STYLES },
	},
};

const DEFAULT_VIEW: View = {
	type: 'table',
	page: 1,
	perPage: 10,
	titleField: 'site',
	mediaField: 'preview',
	showMedia: true,
	layout: { aspectRatio: '16/9', styles: TABLE_STYLES },
	fields: [ 'humanScore', 'aiScore', 'created', 'actions' ],
	filters: [],
	sort: { field: 'created', direction: 'desc' },
};

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

function siteKey( value: string ): string | null {
	try {
		const url = new URL( value.includes( '://' ) ? value : `https://${ value }` );
		return `${ url.hostname.replace( /^www\./, '' ) }${ url.pathname.replace( /\/$/, '' ) }`;
	} catch {
		return null;
	}
}

function Score( { score }: { score: number | null } ) {
	if ( score === null ) {
		return <Text variant="muted">—</Text>;
	}
	let intent: 'stable' | 'medium' | 'high' = 'high';
	if ( score >= 80 ) {
		intent = 'stable';
	} else if ( score >= 50 ) {
		intent = 'medium';
	}
	return <Badge intent={ intent }>{ `${ score }/100` }</Badge>;
}

export default function AmplifyReportsList( {
	agencyId,
	reports,
	isLoading = false,
	isPreview = false,
}: {
	agencyId: number;
	reports: AmplifyReport[];
	isLoading?: boolean;
	isPreview?: boolean;
} ) {
	const { recordTracksEvent } = useAnalytics();
	const locale = useIntlLocale();
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );
	const showSearch = reports.length >= 12;
	useEffect( () => {
		if ( ! showSearch ) {
			setView( ( previous ) => {
				if ( ! previous.search && previous.page === 1 ) {
					return previous;
				}
				return { ...previous, search: '', page: 1 };
			} );
		}
	}, [ showSearch ] );
	const [ reportToArchive, setReportToArchive ] = useState< AmplifyReport | null >( null );
	const archive = useMutation( archiveAmplifyReportMutation( agencyId ) );
	const {
		mutate: retryReport,
		isPending: isRetryPending,
		variables: retryVariables,
	} = useMutation( retryAmplifyReportMutation( agencyId ) );
	const retryingId = isRetryPending ? retryVariables : null;
	const firstSites = useQuery( {
		...paginatedAgencySitesQuery( { page: 1, per_page: 20 }, agencyId ),
		enabled: !! agencyId && reports.length > 0 && ! isPreview,
	} );
	const siteCount = firstSites.data?.total ?? 0;
	const allSites = useQuery( {
		...paginatedAgencySitesQuery( { page: 1, per_page: siteCount || 20 }, agencyId ),
		enabled: !! agencyId && reports.length > 0 && ! isPreview && siteCount > 20,
	} );
	const siteTitles = useMemo( () => {
		const titles = new Map< string, string >();
		for ( const site of allSites.data?.sites ?? firstSites.data?.sites ?? [] ) {
			const key = siteKey( site.url_with_scheme ?? site.url );
			if ( key && site.blogname ) {
				titles.set( key, site.blogname );
			}
		}
		return titles;
	}, [ allSites.data?.sites, firstSites.data?.sites ] );
	const titleFor = useCallback(
		( report: AmplifyReport ) =>
			report.site_title || siteTitles.get( siteKey( report.url ) ?? '' ) || null,
		[ siteTitles ]
	);

	const fields = useMemo< Field< AmplifyReport >[] >(
		() => [
			{
				id: 'site',
				label: __( 'Site' ),
				getValue: ( { item } ) => titleFor( item ) ?? item.url,
				render: ( { item } ) => {
					const title = titleFor( item );
					const failure =
						item.status === 'failed' ? (
							<span className="dashboard-amplify-report-site__failure">
								{ item.failure_reason || __( 'The audit didn’t finish.' ) }
							</span>
						) : null;
					return title ? (
						<span className="dashboard-amplify-report-site">
							<strong>{ title }</strong>
							<span className="dashboard-amplify-url">{ item.url }</span>
							{ failure }
						</span>
					) : (
						<span className="dashboard-amplify-report-site">
							<span className="dashboard-amplify-url dashboard-amplify-url--standalone">
								{ item.url }
							</span>
							{ failure }
						</span>
					);
				},
				enableSorting: true,
				enableGlobalSearch: true,
				enableHiding: false,
			},
			{
				id: 'url',
				label: __( 'URL' ),
				getValue: ( { item } ) => item.url,
				enableSorting: false,
				enableGlobalSearch: true,
			},
			{
				id: 'preview',
				label: __( 'Site preview' ),
				render: ( { item } ) => (
					<SiteScreenshot
						url={ item.url }
						alt={ sprintf(
							/* translators: %s: site title or URL */
							__( 'Preview of %s' ),
							titleFor( item ) ?? item.url
						) }
						compact
					/>
				),
				enableSorting: false,
				enableHiding: false,
			},
			{
				id: 'humanScore',
				label: __( 'First-time visitors' ),
				getValue: ( { item } ) => item.score.human ?? -1,
				render: ( { item } ) =>
					item.status === 'completed' ? (
						<Score score={ item.score.human } />
					) : (
						<Text variant="muted">—</Text>
					),
				enableSorting: true,
			},
			{
				id: 'aiScore',
				label: __( 'AI agents' ),
				getValue: ( { item } ) => item.score.ai ?? -1,
				render: ( { item } ) =>
					item.status === 'completed' ? (
						<Score score={ item.score.ai } />
					) : (
						<Text variant="muted">—</Text>
					),
				enableSorting: true,
			},
			{
				id: 'actions',
				label: __( 'Actions' ),
				header: <span className="dashboard-amplify-results__sr-only">{ __( 'Actions' ) }</span>,
				getValue: ( { item } ) => item.status,
				render: ( { item } ) => {
					let actionContent;
					if ( item.status === 'completed' ) {
						actionContent = (
							<Button
								variant="secondary"
								size="compact"
								href={ item.pdf_url ?? undefined }
								target="_blank"
								rel="noopener noreferrer"
								disabled={ ! item.pdf_url }
								onClick={ () =>
									recordTracksEvent( 'calypso_a4a_amplify_report_download_click', {
										report_id: item.id,
										mode: item.mode,
									} )
								}
							>
								{ __( 'Download PDF' ) }
							</Button>
						);
					} else if ( item.status === 'failed' ) {
						actionContent = (
							<Button
								variant="secondary"
								size="compact"
								isBusy={ retryingId === item.id }
								disabled={ isPreview || !! retryingId }
								accessibleWhenDisabled
								onClick={ () => {
									recordTracksEvent( 'calypso_a4a_amplify_report_retry_click', {
										report_id: item.id,
										mode: item.mode,
									} );
									// BACKEND REQUIRED: the retry endpoint must not count failed or
									// timed-out runs toward `usage.used`. The success notice promises it.
									retryReport( item.id, {
										onSuccess: () =>
											createSuccessNotice(
												__( 'Audit restarted. Failed audits don’t count toward your allowance.' ),
												{ type: 'snackbar' }
											),
										onError: () =>
											createErrorNotice( __( 'Could not restart the audit. Please try again.' ), {
												type: 'snackbar',
											} ),
									} );
								} }
							>
								{ __( 'Retry' ) }
							</Button>
						);
					} else {
						actionContent = (
							<Text variant="muted">
								{ item.status === 'pending' ? __( 'Waiting to start' ) : __( 'In progress' ) }
							</Text>
						);
					}
					return (
						<div className="dashboard-amplify-results__row-actions">
							{ actionContent }
							<Button
								className="dashboard-amplify-results__archive"
								icon={ archiveBoxIcon }
								label={ __( 'Archive report' ) }
								size="compact"
								showTooltip
								variant="tertiary"
								disabled={ isPreview || archive.isPending }
								onClick={ () => {
									setReportToArchive( item );
									recordTracksEvent( 'calypso_a4a_amplify_report_archive_click', {
										report_id: item.id,
										mode: item.mode,
									} );
								} }
							/>
						</div>
					);
				},
				enableSorting: false,
				enableHiding: false,
			},
			{
				id: 'created',
				label: __( 'Created' ),
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
				enableSorting: true,
			},
		],
		[
			archive.isPending,
			createErrorNotice,
			createSuccessNotice,
			isPreview,
			locale,
			recordTracksEvent,
			retryReport,
			retryingId,
			titleFor,
		]
	);

	const { data: visibleReports, paginationInfo } = filterSortAndPaginate( reports, view, fields );
	const isFiltered = !! view.search;

	return (
		<>
			<DataViewsCard>
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
				>
					{ showSearch && (
						<HStack justify="space-between" style={ { padding: '16px 24px' } }>
							<WPDataViews.Search />
							<WPDataViews.ViewConfig />
						</HStack>
					) }
					<WPDataViews.Layout />
					<WPDataViews.Footer />
				</DataViews>
			</DataViewsCard>
			{ reportToArchive && (
				<Modal
					title={ __( 'Archive report?' ) }
					onRequestClose={ () => setReportToArchive( null ) }
					size="small"
				>
					<Text>
						{ sprintf(
							/* translators: %s: website URL */
							__( 'Archive the report for %s? It will disappear from this list.' ),
							reportToArchive.url
						) }
					</Text>
					<ButtonStack justify="flex-end">
						<Button variant="tertiary" onClick={ () => setReportToArchive( null ) }>
							{ __( 'Cancel' ) }
						</Button>
						<Button
							variant="primary"
							isDestructive
							isBusy={ archive.isPending }
							disabled={ archive.isPending }
							onClick={ () => {
								recordTracksEvent( 'calypso_a4a_amplify_report_archive_confirm', {
									report_id: reportToArchive.id,
									mode: reportToArchive.mode,
								} );
								archive.mutate( reportToArchive.id, {
									onSuccess: () => {
										createSuccessNotice( __( 'The report has been archived.' ), {
											type: 'snackbar',
										} );
										setReportToArchive( null );
									},
									onError: () =>
										createErrorNotice( __( 'Could not archive the report. Please try again.' ), {
											type: 'snackbar',
										} ),
								} );
							} }
						>
							{ __( 'Archive' ) }
						</Button>
					</ButtonStack>
				</Modal>
			) }
		</>
	);
}
