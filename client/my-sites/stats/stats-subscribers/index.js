import useSubscribersQuery from 'calypso/state/stats/subscribers/hooks/use-subscribers-query';

const StatsSubscribers = ( { siteId } ) => {
	const name = 'subscribers';
	const { isLoading, data } = useSubscribersQuery( siteId );

	return (
		<div>
			<h1>{ name }</h1>
			{ isLoading && <div>Loading...</div> }
			<ul>
				{ ! isLoading &&
					data?.map( ( item ) =>
						item.data.map( ( dataSet ) => (
							<li> { `${ dataSet.period } - ${ dataSet.subscribers }` }</li>
						) )
					) }
			</ul>
		</div>
	);
};

export default StatsSubscribers;
