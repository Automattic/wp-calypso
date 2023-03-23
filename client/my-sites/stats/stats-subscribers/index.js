import { useSelector } from 'react-redux';
import useSubscribersQuery from 'calypso/state/stats/subscribers/hooks/use-subscribers-query';
import { getSiteStatsSubscribers } from 'calypso/state/stats/subscribers/selectors';

const StatsSubscribers = ( { siteId } ) => {
	const name = 'subscribers';
	const { isLoading } = useSubscribersQuery( siteId );
	const data = useSelector( ( state ) => getSiteStatsSubscribers( state, siteId ) );
	const chartData = data?.data || [];

	return (
		<div>
			<h1>{ name }</h1>
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
