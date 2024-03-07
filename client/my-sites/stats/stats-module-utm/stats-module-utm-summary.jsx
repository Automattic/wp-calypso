import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import StatsModuleDataQuery from '../stats-module/stats-module-data-query';
import statsStrings from '../stats-strings';
import UTMDropdown from './stats-module-utm-dropdown';

const OPTION_KEYS = {
	SOURCE_MEDIUM: 'utm_source,utm_medium',
	CAMPAIGN_SOURCE_MEDIUM: 'utm_campaign,utm_source,utm_medium',
	SOURCE: 'utm_source',
	MEDIUM: 'utm_medium',
	CAMPAIGN: 'utm_campaign',
};

// TODO: Remove this data once the real data is available.
// This is the shape expected by the StatsModuleUTMDebug component.
// Not the shape of the real data from the API.
const sampleData = [
	{
		children: null, // an array of posts using the UTM parameters
		label: 'label', // used for display, ie: "source / medium" (with the spaces)
		paramValues: 'source/medium', // string like "["adwords","ppc"]"
		value: 411, // count of views
	},
];

function StatsModuleUTMSummary( { siteId, period, postId, query, summary, className } ) {
	// Note: The module is loaded multiple times on initial page render.
	// Not sure why this is happening as the props are consistent across initial renders.
	// Maybe worth investigating the routing.
	// console.log( 'StatsModuleUTMDebug', siteId, period, postId, query, summary, className );

	// Log real prop updates.
	useEffect( () => {
		console.log( 'StatsModuleUTMDebug updated', siteId, period, postId, query, summary, className );
	}, [ siteId, period, postId, query, summary, className ] );

	// Continue...
	const moduleStrings = statsStrings();
	const translate = useTranslate();
	const [ selectedOption, setSelectedOption ] = useState( OPTION_KEYS.SOURCE_MEDIUM );

	// Testing a custom hook.
	const { data: d2, isPending, isError, error } = useUTMQuery( siteId, selectedOption, query );
	console.log( 'isPending', isPending );
	if ( ! isPending ) {
		console.log( 'data', d2 );
		console.log( 'isError & error', isError, error );
	}
	const dataLength = d2?.length || 0;

	// Use mock data for now.
	const data = d2;

	// Hide the module if the specific post is the Home page.
	if ( postId === 0 ) {
		return null;
	}

	const hideSummaryLink = postId !== undefined || summary === true;

	const optionLabels = {
		[ OPTION_KEYS.SOURCE_MEDIUM ]: {
			selectLabel: translate( 'Source / Medium' ),
			headerLabel: translate( 'Posts by Source / Medium' ),
			isGrouped: true, // display in a group on top of the dropdown
			// data query action
		},
		[ OPTION_KEYS.CAMPAIGN_SOURCE_MEDIUM ]: {
			selectLabel: translate( 'Campaign / Source / Medium' ),
			headerLabel: translate( 'Posts by Campaign / Source / Medium' ),
			isGrouped: true,
			// data query action
		},
		[ OPTION_KEYS.SOURCE ]: {
			selectLabel: translate( 'Source' ),
			headerLabel: translate( 'Posts by Source' ),
		},
		[ OPTION_KEYS.MEDIUM ]: {
			selectLabel: translate( 'Medium' ),
			headerLabel: translate( 'Posts by Medium' ),
		},
		[ OPTION_KEYS.CAMPAIGN ]: {
			selectLabel: translate( 'Campaign' ),
			headerLabel: translate( 'Posts by Campaign' ),
		},
	};

	const queryString = Object.keys( query )
		.map( ( key ) => `${ key }: ${ query[ key ] }` )
		.join( ', ' );

	return (
		<>
			<p>Query: { queryString } </p>
			<p>Data length: { dataLength } </p>
			<StatsModuleDataQuery
				data={ data }
				path="utm"
				className={ classNames( className, 'stats-module-utm' ) }
				moduleStrings={ moduleStrings.utm }
				period={ period }
				query={ query }
				isLoading={ isPending ?? true }
				hideSummaryLink={ hideSummaryLink }
				selectedOption={ optionLabels[ selectedOption ] }
				toggleControl={
					<UTMDropdown
						buttonLabel={ optionLabels[ selectedOption ].selectLabel }
						onSelect={ setSelectedOption }
						selectOptions={ optionLabels }
						selected={ selectedOption }
					/>
				}
			/>
		</>
	);
}

// Testing a Tanstack version of the API query.
function useUTMQuery( siteId, selectedOption, query ) {
	// Fetch UTM summary data. Does not include top posts.
	// Ideally we'd have the API updated to include that data instead of requiring extra API requests.
	const result = useQuery( {
		queryKey: [ 'useUTMQuery', siteId, selectedOption, query ],
		queryFn: () => fetchUTMMetrics( siteId, selectedOption, query ),
		select: transformData,
	} );

	return result;
}

async function fetchUTMMetrics( siteId, selectedOption, query ) {
	console.log( 'fetchUTMMetrics', siteId, selectedOption, query );

	// Should be the following:
	// https://public-api.wordpress.com/rest/v1.1/sites/147402695/stats/utm/utm_source,utm_medium?http_envelope=1&max=10&date=2024-03-03&days=7&post_id=

	const response = await wpcom.req.get(
		{
			path: `/sites/${ siteId }/stats/utm/${ selectedOption }`,
		},
		{
			...query,
			// max: 5,
			// Today's date in yyyy-mm-dd format.
			// date: new Date().toISOString().split( 'T' )[ 0 ],
			// date: '2024-03-05',
			// days: 7,
			days: query?.num || 1,
			// post_id: postId || '',
			kdl: 'kdl utm metrics',
		}
	);
	// console.log( 'response', response );

	return response;
}

// Utility functions for use with the returned API data.
// Should live with the custom hook once it's moved to its own file.

function isValidJSON( string ) {
	try {
		JSON.parse( string );
		return true;
	} catch ( e ) {
		return false;
	}
}

function parseKey( key ) {
	if ( key.length === 0 ) {
		return key;
	}
	if ( isValidJSON( key ) ) {
		const parsedKey = JSON.parse( key );
		if ( Array.isArray( parsedKey ) ) {
			return parsedKey.join( ' / ' );
		}
		return parsedKey;
	}
	return key;
}

// Example data from API.
// Either a string: number or
// a JSON encoded array: number.
//
// "top_utm_values": {
// 	"adwords": 89,
// 	"bing": 27,
// }
//
// "top_utm_values": {
// 	"[\"adwords\",\"ppc\"]": 89,
// 	"[\"bing\",\"cpc\"]": 27,
// }

function transformData( data ) {
	const utmData = data?.top_utm_values;
	if ( ! utmData ) {
		return [];
	}

	const keys = Object.keys( utmData );
	const values = Object.values( utmData );

	/*
	keys.map( ( key, index ) => {
		console.log( key, index );
	} );
	values.map( ( value, index ) => {
		console.log( value, index );
	} );
	*/

	const transformedData = keys.map( ( key, index ) => {
		// console.log( 'key: ', key, 'typeof: ', typeof key );
		const parsedKey = parseKey( key );
		// console.log( 'parsed key: ', parsedKey );
		return {
			label: parsedKey,
			value: values[ index ],
			paramValues: key,
		};
	} );

	return transformedData;
}

export { StatsModuleUTMSummary as default, StatsModuleUTMSummary, OPTION_KEYS };
