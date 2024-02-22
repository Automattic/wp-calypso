import { useEffect, useState } from 'react';

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

const mockUTMDataSinglePost = [
	{
		source: 'google',
		medium: 'cpc',
		label: 'google / cpc',
		value: 100,
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
];

async function fetchMockDataAsync( postId = undefined ) {
	const fetchDelay = 3000;
	// Simulate an API request so we can see the loading state.
	await new Promise( ( r ) => setTimeout( r, fetchDelay ) );
	if ( postId !== undefined ) {
		return mockUTMDataSinglePost;
	}
	return mockUTMData;
}

export function useMockData( postId ) {
	const [ data, setData ] = useState( null );
	const [ isRequestingData, setIsRequestingData ] = useState( false );

	useEffect( () => {
		async function fetchMockData() {
			const fetchedData = await fetchMockDataAsync( postId );
			setIsRequestingData( false );
			setData( fetchedData );
		}
		setIsRequestingData( true );
		fetchMockData();
	}, [ postId ] );

	return { isRequestingData, data };
}
