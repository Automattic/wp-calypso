import page from '@automattic/calypso-router';
import { __experimentalText as Text } from '@wordpress/components';
import {
	DataViews,
	filterSortAndPaginate,
	type Action,
	type View,
	type ViewTable,
} from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState, type MouseEvent } from 'react';
import { DataViewsCard, DataViewsEmptyStateLayout } from 'calypso/dashboard/components/dataviews';
import { decodeEntities } from 'calypso/lib/formatting';
import { useSelector } from 'calypso/state';
import getPodcastingCategoryId from 'calypso/state/selectors/get-podcasting-category-id';
import { getTerms } from 'calypso/state/terms/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import useEpisodesQuery from '../hooks/use-episodes-query';

type Episode = {
	id: number;
	title: string;
	date: string;
	status: string;
	link: string;
	featuredMediaUrl: string;
};

const defaultView: ViewTable = {
	type: 'table',
	titleField: 'title',
	mediaField: 'media',
	showTitle: true,
	showMedia: true,
	fields: [ 'duration', 'downloads', 'activity', 'date', 'status' ],
	page: 1,
	perPage: 10,
	sort: { field: 'date', direction: 'desc' },
	layout: {
		styles: {
			media: { width: '72px' },
			title: { width: 'auto', minWidth: '260px' },
			duration: { width: '110px' },
			downloads: { width: '120px' },
			activity: { width: '180px' },
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
	const { data, isLoading } = useEpisodesQuery( {
		siteId,
		categoryId: resolvedCategoryId,
	} );

	const episodes = useMemo< Episode[] >( () => {
		const posts = Array.isArray( data ) ? data : [];
		return posts.map( ( post ) => {
			const media = post._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ];
			const thumbnail =
				media?.media_details?.sizes?.thumbnail?.source_url ??
				media?.media_details?.sizes?.medium?.source_url ??
				media?.source_url ??
				'';
			return {
				id: post.id,
				title: decodeEntities( post.title?.rendered ?? '' ),
				date: post.date,
				status: post.status,
				link: post.link,
				featuredMediaUrl: thumbnail,
			};
		} );
	}, [ data ] );

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
				getValue: () => 0,
				enableSorting: false,
			},
			{
				id: 'downloads',
				type: 'integer' as const,
				label: translate( 'Downloads' ) as string,
				getValue: () => 0,
				enableSorting: false,
			},
			{
				id: 'activity',
				type: 'integer' as const,
				label: translate( '30-day activity' ) as string,
				getValue: () => 0,
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

	const sectionHeader = (
		<header className="podcast__section-header">
			<Text as="h2" size="title" className="podcast__section-heading">
				{ translate( 'Episodes' ) }
			</Text>
			<Text as="p" variant="muted" className="podcast__section-description">
				{ translate( 'Manage the posts that make up your podcast feed.' ) }
			</Text>
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
							'Select a podcast category in the Settings tab to start showing episodes here.'
						) as string
					}
				/>
			</>
		);
	}

	const { data: processed, paginationInfo } = filterSortAndPaginate( episodes, view, fields );

	return (
		<>
			{ sectionHeader }
			<DataViewsCard>
				<DataViews< Episode >
					data={ processed }
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
