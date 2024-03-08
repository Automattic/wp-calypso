import { StatsCard } from '@automattic/components';
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { default as usePlanUsageQuery } from '../hooks/use-plan-usage-query';
import useStatsPurchases from '../hooks/use-stats-purchases';
import StatsCardUpsellJetpack from '../stats-card-upsell/stats-card-upsell-jetpack';
import StatsModulePlaceholder from '../stats-module/placeholder';
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

function StatsModuleUTMSummary( { siteId, period, postId, query, summary, className } ) {
	// Note: The module is loaded multiple times on initial page render.
	// Not sure why this is happening as the props are consistent across
	// initial renders. Maybe worth investigating the routing.

	const moduleStrings = statsStrings();
	const translate = useTranslate();
	const [ selectedOption, setSelectedOption ] = useState( OPTION_KEYS.SOURCE_MEDIUM );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	// Check if blog is internal.
	const { isFetching: isFetchingUsage, data: usageData } = usePlanUsageQuery( siteId );
	const { isLoading: isLoadingFeatureCheck, supportCommercialUse } = useStatsPurchases( siteId );

	// Tanstack query without Redux plumbing.
	// That means this specific module does not follow the convention
	// used for the other modules in the stats section.
	const { data, isPending, isError } = useUTMQuery( siteId, selectedOption, query );
	const dataLength = data?.length || 0;

	// Handle network error.
	// We should destinguish between network errors and api errors.
	const isNetworkError = isError && ! isPending;

	const isSiteInternal = ! isFetchingUsage && usageData?.is_internal;
	const isFetching = isFetchingUsage || isLoadingFeatureCheck || isPending;
	const isAdvancedFeatureEnabled = isSiteInternal || supportCommercialUse;

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
			{ isNetworkError && <p>Network error detected</p> }
			{ isFetching && (
				<StatsCard
					title="UTM"
					className={ classNames( className, 'stats-module-utm', 'stats-module__card', 'utm' ) }
				>
					<StatsModulePlaceholder isLoading />
				</StatsCard>
			) }
			{ ! isFetching && ! isAdvancedFeatureEnabled && (
				// TODO: update the ghost card to only show the module name
				<StatsCard
					title="UTM"
					className={ classNames( className, 'stats-module-utm', 'stats-module__card', 'utm' ) }
				>
					<StatsCardUpsellJetpack className="stats-module__upsell" siteSlug={ siteSlug } />
				</StatsCard>
			) }
			{ ! isFetching && isAdvancedFeatureEnabled && (
				<StatsModuleDataQuery
					data={ data }
					path="utm"
					className={ classNames( className, 'stats-module-utm' ) }
					moduleStrings={ moduleStrings.utm }
					period={ period }
					query={ query }
					isLoading={ isFetching ?? true }
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
			) }
		</>
	);
}

function useUTMQuery( siteId, selectedOption, query ) {
	// Fetch UTM summary data. Does not include top posts as that might get
	// out of hand on the summary page. For example, you easily get over
	// 100 API requests when looking at 30 days or more as the period.
	//
	// Ideally we'd have the API updated to include the related posts
	// data instead of requiring extra API requests.

	const result = useQuery( {
		queryKey: [ 'useUTMQuery', siteId, selectedOption, query ],
		queryFn: () => fetchUTMMetrics( siteId, selectedOption, query ),
		select: transformData,
	} );

	return result;
}

async function fetchUTMMetrics( siteId, selectedOption, query ) {
	// API requests look like this:
	//
	// https://public-api.wordpress.com/rest/v1.1/sites/SITE_ID/
	//	stats/utm/UTM_PARAMS?http_envelope=1 -- ie: "utm_source,utm_medium"
	//	&period=day&date=2024-03-07&max=0&days=1 -- from query object
	//	&kdl=kdl%20utm%20metrics -- for filtering in the network tab

	const response = await wpcom.req.get(
		{
			path: `/sites/${ siteId }/stats/utm/${ selectedOption }`,
		},
		{
			...query,
			days: query?.num || 1,
			kdl: 'kdl-utm-metrics',
		}
	);

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

	const transformedData = keys.map( ( key, index ) => {
		const parsedKey = parseKey( key );
		return {
			// children: [], -- include to enable disclosure toggle
			label: parsedKey,
			paramValues: key,
			value: values[ index ],
		};
	} );

	return transformedData;
}

export { StatsModuleUTMSummary as default, StatsModuleUTMSummary, OPTION_KEYS };
