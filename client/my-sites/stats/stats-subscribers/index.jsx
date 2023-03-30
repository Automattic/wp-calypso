import { useSelector } from 'react-redux';
import useSubscribersQuery from 'calypso/my-sites/stats/hooks/use-subscribers-query';
import { getSiteStatsSubscribers } from 'calypso/state/stats/subscribers/selectors';

const StatsSubscribers = ( { siteId } ) => {
	const name = 'subscribers';
	const { isLoading, error } = useSubscribersQuery( siteId );
	const data = useSelector( ( state ) => getSiteStatsSubscribers( state, siteId ) );
	const chartData = data?.data || [];

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
