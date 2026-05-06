import { formatNumber } from '@automattic/number-formatters';
import { Card, CardBody } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import type {
	PodcastStatsAppRow,
	PodcastStatsCountryRow,
	PodcastStatsTopDay,
} from '../hooks/use-show-stats-query';

type StatsSummaryTilesProps = {
	totalPlays?: number | null;
	byApp?: PodcastStatsAppRow[];
	byCountry?: PodcastStatsCountryRow[];
	episodesPublished?: number | null;
	topDay?: PodcastStatsTopDay | null;
	isLoading?: boolean;
	variant?: 'show' | 'episode';
	layout?: 'standalone' | 'chart';
};

const APP_LABELS: Record< string, string > = {
	apple: 'Apple',
	castbox: 'Castbox',
	castro: 'Castro',
	overcast: 'Overcast',
	pocketcasts: 'Pocket Casts',
	'podcast-addict': 'Podcast Addict',
	spotify: 'Spotify',
	web: 'Web',
	other: 'Other',
};

const EMPTY_VALUE = '-';

const formatAppName = ( app: string ) =>
	APP_LABELS[ app ] ??
	app
		.split( '-' )
		.filter( Boolean )
		.map( ( part ) => part.charAt( 0 ).toUpperCase() + part.slice( 1 ) )
		.join( ' ' );

const formatPct = ( pct: number ) =>
	`${ pct.toLocaleString( undefined, { maximumFractionDigits: 1 } ) }%`;

const formatDate = ( date: string ) =>
	new Intl.DateTimeFormat( undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC',
	} ).format( new Date( `${ date }T00:00:00Z` ) );

type DisplayNamesConstructor = new (
	locales: Intl.LocalesArgument | undefined,
	options: { type: 'region' }
) => {
	of: ( code: string ) => string | undefined;
};

const getCountryName = ( country: string, fallback: string ) => {
	if ( ! country ) {
		return fallback;
	}
	const normalized = country.toUpperCase();
	const DisplayNames = ( Intl as typeof Intl & { DisplayNames?: DisplayNamesConstructor } )
		.DisplayNames;
	if ( ! DisplayNames ) {
		return normalized;
	}
	try {
		const displayNames = new DisplayNames( undefined, { type: 'region' } );
		return displayNames.of( normalized ) ?? normalized;
	} catch {
		return normalized;
	}
};

function SummaryTile( {
	heading,
	value,
	note,
	isSelected = false,
	asCard = true,
}: {
	heading: string;
	value: string;
	note?: string;
	isSelected?: boolean;
	asCard?: boolean;
} ) {
	const content = (
		<>
			<div className="highlight-card-heading">{ heading }</div>
			<div className="highlight-card-count">
				<span className="highlight-card-count-value">{ value }</span>
			</div>
			{ note && <div className="podcast-stats-summary__note">{ note }</div> }
		</>
	);
	const className = clsx( 'highlight-card podcast-stats-summary__tile', {
		'is-selected': isSelected,
	} );

	return asCard ? (
		<Card className={ className }>
			<CardBody>{ content }</CardBody>
		</Card>
	) : (
		<div className={ className }>{ content }</div>
	);
}

export const formatPodcastAppName = formatAppName;
export const formatPodcastCountryName = getCountryName;
export const formatPodcastPct = formatPct;
export const formatPodcastDate = formatDate;

export default function StatsSummaryTiles( {
	totalPlays,
	byApp = [],
	byCountry = [],
	episodesPublished,
	topDay,
	isLoading = false,
	variant = 'show',
	layout = 'standalone',
}: StatsSummaryTilesProps ) {
	const translate = useTranslate();
	const topApp = byApp[ 0 ];
	const topCountry = byCountry[ 0 ];
	const loadingValue = isLoading ? EMPTY_VALUE : null;
	const unknownCountry = translate( 'Unknown' ) as string;

	const tiles =
		variant === 'episode'
			? [
					{
						heading: translate( 'Total downloads' ) as string,
						value: loadingValue ?? formatNumber( totalPlays ?? 0 ),
					},
					{
						heading: translate( 'Top app' ) as string,
						value:
							loadingValue ??
							( topApp
								? `${ formatAppName( topApp.app ) } ${ formatPct( topApp.pct ) }`
								: EMPTY_VALUE ),
					},
					{
						heading: translate( 'Top country' ) as string,
						value:
							loadingValue ??
							( topCountry
								? `${ getCountryName( topCountry.country, unknownCountry ) } ${ formatPct(
										topCountry.pct
								  ) }`
								: EMPTY_VALUE ),
					},
					{
						heading: translate( 'Top day' ) as string,
						value: loadingValue ?? ( topDay ? formatDate( topDay.date ) : EMPTY_VALUE ),
						note:
							! loadingValue && topDay
								? ( translate( '%(downloads)s downloads', {
										args: { downloads: formatNumber( topDay.plays ) },
								  } ) as string )
								: undefined,
					},
			  ]
			: [
					{
						heading: translate( 'Total downloads' ) as string,
						value: loadingValue ?? formatNumber( totalPlays ?? 0 ),
					},
					{
						heading: translate( 'Top app' ) as string,
						value:
							loadingValue ??
							( topApp
								? `${ formatAppName( topApp.app ) } ${ formatPct( topApp.pct ) }`
								: EMPTY_VALUE ),
					},
					{
						heading: translate( 'Top country' ) as string,
						value:
							loadingValue ??
							( topCountry
								? `${ getCountryName( topCountry.country, unknownCountry ) } ${ formatPct(
										topCountry.pct
								  ) }`
								: EMPTY_VALUE ),
					},
					{
						heading: translate( 'Episodes published' ) as string,
						value: loadingValue ?? formatNumber( episodesPublished ?? 0 ),
					},
			  ];

	return (
		<section
			className={ clsx( 'podcast-stats-summary', {
				'highlight-cards': layout === 'standalone',
				'podcast-stats-summary--chart': layout === 'chart',
			} ) }
		>
			<div className="highlight-cards-list podcast-stats-summary__list">
				{ tiles.map( ( tile, index ) => (
					<SummaryTile
						key={ tile.heading }
						heading={ tile.heading }
						value={ tile.value }
						note={ tile.note }
						isSelected={ index === 0 }
						asCard={ layout === 'standalone' }
					/>
				) ) }
			</div>
		</section>
	);
}
