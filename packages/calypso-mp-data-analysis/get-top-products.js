import { get } from 'axios';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import fs from 'fs-extra';

const getLocale = ( lang ) => {
	if ( lang === 'en' ) {
		return 'en_US';
	}

	if ( lang.length === 2 ) {
		return `${ lang }_${ lang.toUpperCase() }`;
	}

	return lang.replace( '-', '_' );
};

const productsCountMap = {};
const csvFileContent = await fs.readFile( './top-100-searches.csv', {
	encoding: 'utf-8',
} );
const records = parse( csvFileContent, {
	columns: true,
	skip_empty_lines: true,
} );

for ( const record of records ) {
	const { data: wporgData } = await get( 'https://api.wordpress.org/plugins/info/1.2/', {
		params: {
			action: 'query_plugins',
			'request[page]': 1,
			'request[per_page]': 24,
			'request[search]': record.search_term,
			'request[locale]': getLocale( record.language ),
		},
	} );

	const { data: wpcomData } = await get(
		'https://public-api.wordpress.com/wpcom/v2/marketplace/products',
		{
			params: {
				type: 'all',
				_envelope: 1,
				q: record.search_term,
			},
		}
	);

	const wpcomPlugins = Object.values( wpcomData.body.results );
	const wporgPlugins = Object.values( wporgData.plugins );

	const plugins = [ ...wpcomPlugins, ...wporgPlugins ].slice( 0, 6 ); // show top 6 plugins

	// eslint-disable-next-line no-console
	console.log(
		`fetched plugins for ${ record.search_term }: locale - ${ getLocale(
			record.language
		) } results - wpcom: ${ wpcomPlugins.length } | wporg: ${ wporgPlugins.length }`
	);

	plugins.forEach( ( plugin ) => {
		productsCountMap[ plugin.slug ] = {
			count: productsCountMap[ plugin.slug ]
				? productsCountMap[ plugin.slug ].count + parseInt( record.count )
				: parseInt( record.count ),
		};
	} );
}

const results = Object.keys( productsCountMap )
	.map( ( slug ) => ( {
		product: slug,
		count: productsCountMap[ slug ].count,
		locales: productsCountMap[ slug ].locales,
	} ) )
	.sort( ( a, b ) => a.count - b.count )
	.reverse()
	.slice( 0, 250 ); // limit to 250 records

await fs.outputFile(
	'results/top-products.csv',
	stringify( results, { columns: [ { key: 'product' }, { key: 'count' } ], header: true } )
);
