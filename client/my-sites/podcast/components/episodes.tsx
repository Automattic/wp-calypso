import page from '@automattic/calypso-router';
import { DataViews, type Action, type View, type ViewTable } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState, type MouseEvent } from 'react';
import { DataViewsCard, DataViewsEmptyStateLayout } from 'calypso/dashboard/components/dataviews';
import { decodeEntities } from 'calypso/lib/formatting';
import { useSelector } from 'calypso/state';
import getPodcastingCategoryId from 'calypso/state/selectors/get-podcasting-category-id';
import { getTerms } from 'calypso/state/terms/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import useEpisodeStatsQuery from '../hooks/use-episode-stats-query';
import useEpisodesQuery, {
	type EpisodesOrder,
	type EpisodesOrderBy,
} from '../hooks/use-episodes-query';

type Episode = {
	id: number;
	title: string;
	date: string;
	status: string;
	link: string;
	featuredMediaUrl: string;
	playsAll: number;
	durationSeconds: number | null;
};

const formatDuration = ( seconds: number | null ): string => {
	if ( seconds == null || seconds <= 0 ) {
		return '—';
	}
	const h = Math.floor( seconds / 3600 );
	const m = Math.floor( ( seconds % 3600 ) / 60 );
	const s = seconds % 60;
	const pad = ( n: number ) => String( n ).padStart( 2, '0' );
	return h > 0 ? `${ h }:${ pad( m ) }:${ pad( s ) }` : `${ m }:${ pad( s ) }`;
};

const defaultView: ViewTable = {
	type: 'table',
	titleField: 'title',
	mediaField: 'media',
	showTitle: true,
	showMedia: true,
	fields: [ 'duration', 'downloads', 'date', 'status' ],
	page: 1,
	perPage: 10,
	sort: { field: 'date', direction: 'desc' },
	layout: {
		styles: {
			media: { width: '72px' },
			title: { width: 'auto', minWidth: '260px' },
			duration: { width: '110px' },
			downloads: { width: '120px' },
			date: { width: '150px' },
			status: { width: '140px' },
		},
	},
};

const Episodes = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	// Prefer the podcasting_category_id site setting; fall back to a category
	// named "Podcast" so existing sites with episodes (but no legacy setting)
	// still populate the list.
	const resolvedCategoryId = useSelector( ( state ) => {
		if ( ! siteId ) {
			return 0;
		}
		const settingId = getPodcastingCategoryId( state, siteId );
		if ( settingId ) {
			return Number( settingId );
		}
		const terms = getTerms( state, siteId, 'category' );
		const match = Array.isArray( terms )
			? terms.find( ( term ) => term?.name?.toLowerCase?.() === 'podcast' )
			: null;
		return match ? Number( match.ID ) : 0;
	} );

	const [ view, setView ] = useState< View >( defaultView );

	// Translate the DataViews view state into wp/v2/posts query params so the
	// server does pagination, sorting (date/title only), search, and the
	// status filter. Duration and downloads come from a separate stats
	// endpoint and aren't server-orderable, so their columns are unsortable.
	const queryParams = useMemo( () => {
		const sortField = view.sort?.field;
		const orderBy: EpisodesOrderBy =
			sortField === 'title' || sortField === 'date' ? sortField : 'date';
		const order: EpisodesOrder = view.sort?.direction === 'asc' ? 'asc' : 'desc';
		const statusFilter = view.filters?.find( ( filter ) => filter.field === 'status' );
		const status =
			typeof statusFilter?.value === 'string' && statusFilter.value ? statusFilter.value : 'any';
		return {
			page: view.page ?? 1,
			perPage: view.perPage ?? 10,
			orderBy,
			order,
			search: view.search ?? '',
			status,
		};
	}, [ view.page, view.perPage, view.sort, view.search, view.filters ] );

	const { data, isLoading } = useEpisodesQuery( {
		siteId,
		categoryId: resolvedCategoryId,
		...queryParams,
	} );

	const posts = useMemo( () => data?.posts ?? [], [ data ] );
	const totalItems = data?.totalItems ?? 0;
	const totalPages = data?.totalPages ?? 0;

	const postIds = useMemo< number[] >( () => posts.map( ( post ) => post.id ), [ posts ] );
	const { data: statsByPostId } = useEpisodeStatsQuery( siteId, postIds );

	const episodes = useMemo< Episode[] >( () => {
		return posts.map( ( post ) => {
			const media = post._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ];
			const thumbnail =
				media?.media_details?.sizes?.thumbnail?.source_url ??
				media?.media_details?.sizes?.medium?.source_url ??
				media?.source_url ??
				'';
			const stats = statsByPostId?.get( post.id );
			return {
				id: post.id,
				title: decodeEntities( post.title?.rendered ?? '' ),
				date: post.date,
				status: post.status,
				link: post.link,
				featuredMediaUrl: thumbnail,
				playsAll: stats?.plays_all ?? 0,
				durationSeconds: stats?.duration_seconds ?? null,
			};
		} );
	}, [ posts, statsByPostId ] );

	const statusLabels = useMemo< Record< string, string > >(
		() => ( {
			publish: translate( 'Published' ) as string,
			future: translate( 'Scheduled' ) as string,
			draft: translate( 'Draft' ) as string,
			pending: translate( 'Pending review' ) as string,
			private: translate( 'Private' ) as string,
		} ),
		[ translate ]
	);

	const fields = useMemo(
		() => [
			{
				id: 'media',
				label: translate( 'Featured image' ) as string,
				getValue: ( { item }: { item: Episode } ) => item.featuredMediaUrl,
				render: ( { item }: { item: Episode } ) =>
					item.featuredMediaUrl ? (
						<img src={ item.featuredMediaUrl } alt="" className="podcast__episode-thumb" />
					) : (
						<div
							className="podcast__episode-thumb podcast__episode-thumb--placeholder"
							aria-hidden="true"
						/>
					),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'title',
				label: translate( 'Title' ) as string,
				getValue: ( { item }: { item: Episode } ) => item.title,
				render: ( { item }: { item: Episode } ) => {
					const editUrl = `/post/${ siteSlug }/${ item.id }`;
					const onClick = ( event: MouseEvent< HTMLAnchorElement > ) => {
						if (
							event.defaultPrevented ||
							event.button !== 0 ||
							event.metaKey ||
							event.ctrlKey ||
							event.shiftKey ||
							event.altKey
						) {
							return;
						}
						event.preventDefault();
						page( editUrl );
					};
					return (
						<a href={ editUrl } onClick={ onClick }>
							{ item.title || ( translate( '(Untitled)' ) as string ) }
						</a>
					);
				},
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
			},
			{
				id: 'duration',
				type: 'integer' as const,
				label: translate( 'Duration' ) as string,
				getValue: ( { item }: { item: Episode } ) => item.durationSeconds ?? 0,
				render: ( { item }: { item: Episode } ) => formatDuration( item.durationSeconds ),
				// Duration comes from podcast-stats/episode-totals, not wp/v2/posts,
				// so the server can't order by it.
				enableSorting: false,
			},
			{
				id: 'downloads',
				type: 'integer' as const,
				label: translate( 'Downloads' ) as string,
				getValue: ( { item }: { item: Episode } ) => item.playsAll,
				// Same as duration: live in the stats endpoint, not orderable server-side.
				enableSorting: false,
			},
			{
				id: 'date',
				type: 'datetime' as const,
				label: translate( 'Date' ) as string,
				getValue: ( { item }: { item: Episode } ) => item.date,
				format: { datetime: 'M j, Y' },
				enableSorting: true,
			},
			{
				id: 'status',
				label: translate( 'Status' ) as string,
				getValue: ( { item }: { item: Episode } ) => item.status,
				render: ( { item }: { item: Episode } ) => statusLabels[ item.status ] ?? item.status,
				elements: Object.entries( statusLabels ).map( ( [ value, label ] ) => ( {
					value,
					label,
				} ) ),
				filterBy: { operators: [ 'is' as const ] },
				enableSorting: true,
			},
		],
		[ siteSlug, statusLabels, translate ]
	);

	const actions = useMemo< Action< Episode >[] >(
		() => [
			{
				id: 'edit',
				label: translate( 'Edit' ) as string,
				callback: ( items: Episode[] ) => {
					const item = items[ 0 ];
					if ( item ) {
						page( `/post/${ siteSlug }/${ item.id }` );
					}
				},
			},
			{
				id: 'view',
				label: translate( 'View' ) as string,
				callback: ( items: Episode[] ) => {
					const item = items[ 0 ];
					if ( item?.link ) {
						window.open( item.link, '_blank', 'noopener,noreferrer' );
					}
				},
			},
		],
		[ siteSlug, translate ]
	);

	const paginationInfo = useMemo(
		() => ( { totalItems, totalPages } ),
		[ totalItems, totalPages ]
	);

	const sectionHeader = (
		<header className="podcast__section-header">
			<h2 className="podcast__section-heading">{ translate( 'Episodes' ) }</h2>
			<p className="podcast__section-description">
				{ translate( 'Manage the posts that make up your podcast feed.' ) }
			</p>
		</header>
	);

	if ( ! resolvedCategoryId ) {
		return (
			<>
				{ sectionHeader }
				<DataViewsEmptyStateLayout
					isBorderless
					title={ translate( 'No podcast episodes yet.' ) as string }
					description={
						translate(
							'Set a podcast category in your podcasting settings to start showing episodes here.'
						) as string
					}
				/>
			</>
		);
	}

	return (
		<>
			{ sectionHeader }
			<DataViewsCard>
				<DataViews< Episode >
					data={ episodes }
					fields={ fields }
					view={ view }
					onChangeView={ setView }
					actions={ actions }
					paginationInfo={ paginationInfo }
					getItemId={ ( item ) => String( item.id ) }
					isLoading={ isLoading }
					defaultLayouts={ { table: {} } }
					search
				/>
			</DataViewsCard>
		</>
	);
};

export default Episodes;
