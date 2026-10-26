import { parseSiteUrl } from '../add-new-site/lib';

export const SITE_REVIEW_BULK_THRESHOLD = 10;

export interface IntakeSite {
	id: string;
	url: string;
	name: string;
	staging: boolean;
}
export interface IntakeResult {
	sites: IntakeSite[];
	duplicates: number;
}

const sampleNames = [
	'Juniper Studio',
	'Northstar Coffee',
	'Fern & Field',
	'Harbor Dental',
	'Good Day Bakery',
	'Paper Plane',
	'Oak Street Books',
	'Brightside Yoga',
	'Cedar House',
	'Wildflower Florist',
	'Sunday Supply',
	'Little Mountain',
	'Bluebird Travel',
	'West End Arts',
	'Moss Architecture',
	'Coast & Clay',
	'Maple Kitchen',
	'Atlas Cycling',
	'Kindred Goods',
	'Riverbank Hotel',
	'New Leaf Garden',
	'Common Ground',
	'Pine & Post',
	'Open Door Theatre',
	'Studio Olive',
	'Meadow Market',
	'Golden Hour',
	'Local Table',
	'Scout Outdoor',
	'Willow Wellness',
];
export const sampleSiteList = sampleNames
	.map(
		( name, index ) =>
			`${ name }\t${ index === 29 ? 'staging.' : '' }${ name.toLowerCase().replace( /[^a-z]/g, '' ) }.example`
	)
	.join( '\n' );

/** Accept pasted cells, CSV, or prose without requiring a particular column order. */
export function parseSiteList( input: string ): IntakeResult {
	const sites = new Map< string, IntakeSite >();
	let duplicates = 0;
	for ( const row of input.split( /\r?\n/ ) ) {
		const matches = row.matchAll(
			/https?:\/\/[^\s<>"',;]+|(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?:\/[^\s<>"',;]*)?/gi
		);
		for ( const match of matches ) {
			// An email address or unsupported URL scheme is not a website to connect.
			if ( /[@\w./:-]$/.test( row.slice( 0, match.index ) ) ) {
				continue;
			}
			const parsed = parseSiteUrl( match[ 0 ].replace( /[).!?]+$/, '' ) );
			if ( ! parsed || parsed.username || parsed.password ) {
				continue;
			}
			const path = parsed.pathname
				.replace( /\/(?:wp-admin|wp-login\.php).*$/, '' )
				.replace( /\/$/, '' );
			const id = `${ parsed.hostname.replace( /^www\./, '' ) }${ path }`;
			if ( sites.has( id ) ) {
				duplicates++;
				continue;
			}
			const cells = row.split( /[\t,;]+/ ).map( ( cell ) => cell.trim().replace( /^"|"$/g, '' ) );
			const name = cells.length > 1 && ! /[.@/:]/.test( cells[ 0 ] ) ? cells[ 0 ] : parsed.hostname;
			sites.set( id, {
				id,
				url: `${ parsed.origin }${ path }`,
				name: name || parsed.hostname,
				staging: /(?:^|[.-])(?:staging|stage|dev|test)(?:[.-]|$)/i.test( parsed.hostname ),
			} );
		}
	}
	return { sites: [ ...sites.values() ], duplicates };
}

export async function readSiteFile( file: File ): Promise< string > {
	if ( file.size > 5 * 1024 * 1024 ) {
		throw new Error( 'file-too-large' );
	}
	if ( /\.xlsx$/i.test( file.name ) ) {
		const { default: readXlsxFile } = await import( 'read-excel-file/browser' );
		const sheets = await readXlsxFile( file );
		return sheets
			.flatMap( ( sheet ) => sheet.data )
			.map( ( row ) => row.map( ( cell ) => cell ?? '' ).join( '\t' ) )
			.join( '\n' );
	}
	if ( ! /\.(csv|tsv|txt)$/i.test( file.name ) ) {
		throw new Error( 'unsupported-file' );
	}
	return file.text();
}
