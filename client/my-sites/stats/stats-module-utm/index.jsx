import { useEffect, useState } from 'react';
import StatsModule from '../stats-module';
import statsStrings from '../stats-strings';

// TODO: Replace mock data with real data.
// The mock data is behind a network request to simulate a real-world scenario.

const mockUTMData = [
	{
		source: 'google',
		medium: 'cpc',
		label: 'google / cpc',
		value: 100,
		children: [
			{ label: 'hello world', value: 50 },
			{ label: 'another world', value: 25 },
		],
	},
	{
		source: 'bing',
		medium: 'organic',
		label: 'bing / organic',
		value: 50,
	},
	{
		source: 'yahoo',
		medium: 'organic',
		label: 'yahoo / organic',
		value: 25,
	},
	{
		source: 'facebook',
		medium: 'social',
		label: 'facebook / social',
		value: 10,
	},
	{
		source: 'twitter',
		medium: 'social',
		label: 'twitter / social',
		value: 5,
	},
];

async function fetchMockDataAsync() {
	// Make an API request. This will fail without an API key but we don't care.
	const response = await fetch( `https://api.api-ninjas.com/v1/loremipsum?paragraphs=4` );
	const data = await response.json();
	return data;
}

function useMockData() {
	const [ data, setData ] = useState( null );
	const [ isRequestingData, setIsRequestingData ] = useState( false );

	useEffect( () => {
		async function fetchMockData() {
			// eslint-disable-next-line no-unused-vars
			const fetchedData = await fetchMockDataAsync();
			setIsRequestingData( false );
			setData( mockUTMData );
		}
		setIsRequestingData( true );
		fetchMockData();
	}, [] );

	return { isRequestingData, data };
}

const StatsModuleUTM = ( props ) => {
	const { period, query } = props;
	const moduleStrings = statsStrings();

	const moduleState = useMockData();
	console.log( moduleState );

	return (
		<StatsModule
			path="utm"
			moduleStrings={ moduleStrings.utm }
			period={ period }
			query={ query }
			statType="statsTopAuthors"
			showSummaryLink
		/>
	);
};

export default StatsModuleUTM;
