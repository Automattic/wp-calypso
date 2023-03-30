import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import useSubscribersQuery from 'calypso/my-sites/stats/hooks/use-subscribers-query';
import { getSiteStatsSubscribers } from 'calypso/state/stats/subscribers/selectors';

const StatsSubscribers = ( { siteId } ) => {
	const name = 'subscribers';
	const [ error, setError ] = useState( null );
	const { isLoading } = useSubscribersQuery( siteId );
	const data = useSelector( ( state ) => getSiteStatsSubscribers( state, siteId ) );
	const chartData = data?.data || [];

	useEffect( () => {
		if ( error ) {
			const timer = setTimeout( () => {
				setError( null );
			}, 5000 );
			return () => clearTimeout( timer );
		}
	}, [ error ] );

	return (
		<div>
			<h1>{ name }</h1>
			{ error && <div>Error: { error.message }</div> }
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
