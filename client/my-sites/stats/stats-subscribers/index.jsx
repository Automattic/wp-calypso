import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import useSubscribersQuery from 'calypso/my-sites/stats/hooks/use-subscribers-query';
import { getSiteStatsSubscribers } from 'calypso/state/stats/subscribers/selectors';

const StatsSubscribers = ( { siteId } ) => {
	const name = 'subscribers';
	const { isLoading, error } = useSubscribersQuery( siteId );
	const data = useSelector( ( state ) => getSiteStatsSubscribers( state, siteId ) );
	const chartData = data?.data || [];

	const [ errorMessage, setErrorMessage ] = useState( '' );

	useEffect( () => {
		if ( error ) {
			setErrorMessage( error.message );
		}
	}, [ error ] );

	return (
		<div>
			<h1>{ name }</h1>
			{ errorMessage && <div>Error: { errorMessage }</div> }
			{ isLoading && <div>Loading...</div> }
			<ul>
				{ ! isLoading &&
					chartData?.map( ( dataSet ) => (
						<li> { `${ dataSet.period } - ${ dataSet.subscribers }` }</li>
					) ) }
			</ul>
		</div>
	);
};

export default StatsSubscribers;
