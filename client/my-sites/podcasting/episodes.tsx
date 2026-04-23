import page from '@automattic/calypso-router';
import {
	DataViews,
	filterSortAndPaginate,
	type Action,
	type View,
	type ViewTable,
} from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState, type MouseEvent } from 'react';
import { decodeEntities } from 'calypso/lib/formatting';
import { useSelector } from 'calypso/state';
import getPodcastingCategoryId from 'calypso/state/selectors/get-podcasting-category-id';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import useEpisodesQuery from './use-episodes-query';

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

const formatDate = ( iso: string ) => {
	if ( ! iso ) {
		return '';
	}
	const d = new Date( iso );
	if ( isNaN( d.getTime() ) ) {
		return iso;
	}
	return d.toLocaleDateString( undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	} );
};

const Placeholder = () => <span className="podcasting__placeholder">—</span>;

const PodcastingEpisodes = () => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const categoryId = useSelector( ( state ) =>
		siteId ? getPodcastingCategoryId( state, siteId ) : null
	);
	const numericCategoryId = categoryId ? Number( categoryId ) : 0;

	const [ view, setView ] = useState< View >( defaultView );
	const { data, isLoading } = useEpisodesQuery( {
		siteId,
		categoryId: numericCategoryId,
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
						<img src={ item.featuredMediaUrl } alt="" className="podcasting__episode-thumb" />
					) : (
						<div
							className="podcasting__episode-thumb podcasting__episode-thumb--placeholder"
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
				label: translate( 'Duration' ) as string,
				getValue: () => 0,
				render: () => <Placeholder />,
				enableSorting: false,
			},
			{
				id: 'downloads',
				label: translate( 'Downloads' ) as string,
				getValue: () => 0,
				render: () => <Placeholder />,
				enableSorting: false,
			},
			{
				id: 'activity',
				label: translate( '30-day activity' ) as string,
				getValue: () => 0,
				render: () => <Placeholder />,
				enableSorting: false,
			},
			{
				id: 'date',
				label: translate( 'Date' ) as string,
				getValue: ( { item }: { item: Episode } ) => item.date,
				render: ( { item }: { item: Episode } ) => formatDate( item.date ),
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
		<header className="podcasting__section-header">
			<h2 className="podcasting__section-heading">{ translate( 'Episodes' ) }</h2>
			<p className="podcasting__section-description">
				{ translate( 'Manage the posts that make up your podcast feed.' ) }
			</p>
		</header>
	);

	if ( ! numericCategoryId ) {
		return (
			<>
				{ sectionHeader }
				<div className="podcasting__episodes-empty">
					{ translate(
						'Select a podcast category in the Settings tab to start showing episodes here.'
					) }
				</div>
			</>
		);
	}

	const { data: processed, paginationInfo } = filterSortAndPaginate( episodes, view, fields );

	return (
		<>
			{ sectionHeader }
			<div className="podcasting__episodes">
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
			</div>
		</>
	);
};

export default PodcastingEpisodes;
