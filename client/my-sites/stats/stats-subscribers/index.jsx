import { useState, useEffect } from 'react';
import useSubscribersQuery from 'calypso/my-sites/stats/hooks/use-subscribers-query';

const StatsSubscribers = ( { siteId } ) => {
	const name = 'subscribers';
	const { isLoading, isError, data, error, status } = useSubscribersQuery( siteId );
	const chartData = data?.data || [];

	const [ errorMessage, setErrorMessage ] = useState( '' );

	useEffect( () => {
		if ( isError && error ) {
			setErrorMessage( error.message );
		}
	}, [ status, error, isError ] );

	return (
		<div>
			<h1>{ name }</h1>
			{ errorMessage && <div>Error: { errorMessage }</div> }
			{ isLoading && <div>Loading...</div> }
			<div>
				{ ! isLoading &&
					chartData?.map( ( dataSet ) => (
						<span> { `[${ dataSet.period } - ${ dataSet.subscribers }] ` }</span>
					) ) }
			</div>
		</div>
	);
};

export default StatsSubscribers;
