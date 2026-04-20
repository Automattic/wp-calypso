import {
	DataViews,
	filterSortAndPaginate,
	type Action,
	type View,
	type ViewTable,
} from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
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
	downloads: number;
	dailyDownloads: number[];
	trendPct: number;
	durationSeconds: number;
};

const seededRandom = ( seed: number ) => {
	const x = Math.sin( seed ) * 10000;
	return x - Math.floor( x );
};

const buildFakeStats = ( id: number ) => {
	const base = Math.floor( seededRandom( id * 7 + 3 ) * 40000 ) + 800;
	const daily: number[] = [];
	for ( let i = 0; i < 30; i++ ) {
		const noise = seededRandom( id * 97 + i * 13 );
		const wave = Math.sin( i / 4 + seededRandom( id ) * Math.PI * 2 ) * 0.3 + 1;
		daily.push( Math.max( 1, Math.floor( ( base / 30 ) * wave * ( 0.6 + noise * 0.8 ) ) ) );
	}
	const firstHalf = daily.slice( 0, 15 ).reduce( ( a, b ) => a + b, 0 );
	const secondHalf = daily.slice( 15 ).reduce( ( a, b ) => a + b, 0 );
	const trend = firstHalf === 0 ? 0 : ( ( secondHalf - firstHalf ) / firstHalf ) * 100;
	// 10 to 95 minutes, rounded to the nearest 15 seconds.
	const durationSeconds = Math.round( ( seededRandom( id * 29 + 11 ) * 5100 + 600 ) / 15 ) * 15;
	return {
		downloads: base,
		dailyDownloads: daily,
		trendPct: Math.round( trend ),
		durationSeconds,
	};
};

const formatDuration = ( total: number ) => {
	const s = Math.max( 0, Math.floor( total ) );
	const hours = Math.floor( s / 3600 );
	const minutes = Math.floor( ( s % 3600 ) / 60 );
	const seconds = s % 60;
	const pad = ( n: number ) => String( n ).padStart( 2, '0' );
	if ( hours > 0 ) {
		return `${ hours }:${ pad( minutes ) }:${ pad( seconds ) }`;
	}
	return `${ minutes }:${ pad( seconds ) }`;
};

const Sparkline = ( { data, trend }: { data: number[]; trend: number } ) => {
	const width = 88;
	const height = 28;
	const padding = 2;
	const max = Math.max( ...data );
	const min = Math.min( ...data );
	const range = max - min || 1;
	const coords = data.map( ( v, i ) => {
		const x = ( i / ( data.length - 1 ) ) * width;
		const y = height - padding - ( ( v - min ) / range ) * ( height - padding * 2 );
		return [ x, y ] as const;
	} );
	const line = coords
		.map( ( [ x, y ], i ) => `${ i === 0 ? 'M' : 'L' }${ x.toFixed( 1 ) },${ y.toFixed( 1 ) }` )
		.join( ' ' );
	const area = `${ line } L${ width },${ height } L0,${ height } Z`;
	const stroke = trend >= 0 ? 'var(--studio-green-50)' : 'var(--studio-red-50)';
	return (
		<svg
			width={ width }
			height={ height }
			viewBox={ `0 0 ${ width } ${ height }` }
			className="podcasting-details__sparkline"
			aria-hidden="true"
		>
			<path d={ area } fill={ stroke } opacity="0.12" />
			<path
				d={ line }
				fill="none"
				stroke={ stroke }
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

const STATUS_LABELS: Record< string, string > = {
	publish: 'Published',
	future: 'Scheduled',
	draft: 'Draft',
	pending: 'Pending review',
	private: 'Private',
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

const formatDate = ( iso: string, locale?: string ) => {
	if ( ! iso ) {
		return '';
	}
	const d = new Date( iso );
	if ( isNaN( d.getTime() ) ) {
		return iso;
	}
	return d.toLocaleDateString( locale || 'en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	} );
};

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
				...buildFakeStats( post.id ),
			};
		} );
	}, [ data ] );

	const fields = useMemo(
		() => [
			{
				id: 'media',
				label: translate( 'Featured image' ) as string,
				getValue: ( { item }: { item: Episode } ) => item.featuredMediaUrl,
				render: ( { item }: { item: Episode } ) =>
					item.featuredMediaUrl ? (
						<img
							src={ item.featuredMediaUrl }
							alt=""
							className="podcasting-details__episode-thumb"
						/>
					) : (
						<div
							className="podcasting-details__episode-thumb podcasting-details__episode-thumb--placeholder"
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
				render: ( { item }: { item: Episode } ) => (
					<a href={ `/post/${ siteSlug }/${ item.id }` }>
						{ item.title || ( translate( '(Untitled)' ) as string ) }
					</a>
				),
				enableHiding: false,
				enableSorting: true,
				enableGlobalSearch: true,
			},
			{
				id: 'duration',
				label: translate( 'Duration' ) as string,
				getValue: ( { item }: { item: Episode } ) => item.durationSeconds,
				render: ( { item }: { item: Episode } ) => (
					<span className="podcasting-details__duration">
						{ formatDuration( item.durationSeconds ) }
					</span>
				),
				enableSorting: true,
			},
			{
				id: 'downloads',
				label: translate( 'Downloads' ) as string,
				getValue: ( { item }: { item: Episode } ) => item.downloads,
				render: ( { item }: { item: Episode } ) => (
					<span className="podcasting-details__downloads">{ item.downloads.toLocaleString() }</span>
				),
				enableSorting: true,
			},
			{
				id: 'activity',
				label: translate( '30-day activity' ) as string,
				getValue: ( { item }: { item: Episode } ) => item.trendPct,
				render: ( { item }: { item: Episode } ) => {
					const sign = item.trendPct > 0 ? '+' : '';
					let modifier = 'flat';
					if ( item.trendPct > 0 ) {
						modifier = 'up';
					} else if ( item.trendPct < 0 ) {
						modifier = 'down';
					}
					const cls = `podcasting-details__trend podcasting-details__trend--${ modifier }`;
					return (
						<div className="podcasting-details__activity">
							<Sparkline data={ item.dailyDownloads } trend={ item.trendPct } />
							<span className={ cls }>
								{ sign }
								{ item.trendPct }%
							</span>
						</div>
					);
				},
				enableSorting: true,
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
				render: ( { item }: { item: Episode } ) => STATUS_LABELS[ item.status ] ?? item.status,
				elements: Object.entries( STATUS_LABELS ).map( ( [ value, label ] ) => ( {
					value,
					label,
				} ) ),
				filterBy: { operators: [ 'is' as const ] },
				enableSorting: true,
			},
		],
		[ siteSlug, translate ]
	);

	const actions = useMemo< Action< Episode >[] >(
		() => [
			{
				id: 'edit',
				label: translate( 'Edit' ) as string,
				callback: ( items: Episode[] ) => {
					const item = items[ 0 ];
					if ( item ) {
						window.location.href = `/post/${ siteSlug }/${ item.id }`;
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
		<header className="podcasting-details__section-header">
			<h2 className="podcasting-details__section-heading">{ translate( 'Episodes' ) }</h2>
			<p className="podcasting-details__section-description">
				{ translate( 'Manage the posts that make up your podcast feed.' ) }
			</p>
		</header>
	);

	if ( ! numericCategoryId ) {
		return (
			<>
				{ sectionHeader }
				<div className="podcasting-details__episodes-empty">
					{ translate(
						'Select a podcast category in Feed settings to start showing episodes here.'
					) }
				</div>
			</>
		);
	}

	const { data: processed, paginationInfo } = filterSortAndPaginate( episodes, view, fields );

	return (
		<>
			{ sectionHeader }
			<div className="podcasting-details__episodes">
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
