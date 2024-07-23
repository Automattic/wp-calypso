import moment from 'moment';
import { useEffect, useState } from 'react'; // eslint-disable-line no-unused-vars -- used in the jsdoc types
import wpcom from 'calypso/lib/wp';
import './style.scss';

interface PlanSiteVisitsProps {
	siteId: number;
}

export function PlanSiteVisits( { siteId }: PlanSiteVisitsProps ) {
	const [ visitsNumber, setVisitsNumber ] = useState< number | null >( null );

	useEffect( () => {
		// It's possible to go with `unit` as `month` and `quantity` as `1` to get the last month's data
		// but I tested thoroughly  it doesn't work for this case, since looks like it doesn't include the current (today) day,
		// and additionally it provides extra info about previous month, if, for example, `date` is the first day of the month (e.g. "2024-07-01")
		// so I decided that it worth to make extra calculations (get specific days and sum them) to be explicit and ensure that rendered data is correct
		// -----------------
		// Also, I considered option to use getHighlights[ PAST_THIRTY_DAYS ], but according to my investigation - it totally doesn't work for our case:
		// 1) It doesn't include current day
		// 2) It counts not calendar month, but 30 days from the "yesterday"
		const todayDate = moment().format( 'YYYY-MM-DD' );
		const numberOfDays = todayDate.split( '-' ).pop();
		wpcom.req
			.get( `/sites/${ siteId }/stats/visits`, {
				unit: 'day',

				quantity: numberOfDays,
				date: todayDate,
				stat_fields: 'views',
			} )
			.then( ( result ) => {
				const views = result.data.reduce(
					( acc: number, [ , curr ]: [ string, number ] ) => acc + curr,
					0
				);

				setVisitsNumber( views );
			} );
	}, [ siteId ] );

	if ( ! visitsNumber ) {
		return;
	}

	return (
		<div>
			<div
				style={ {
					display: 'flex',
					justifyContent: 'space-between',
					padding: '20px 0',
				} }
			>
				<div>Unlimited Site visits</div>
				<div
					title={
						'From ' +
						moment().startOf( 'month' ).format( 'YYYY-MM-DD' ) +
						' to ' +
						moment().format( 'YYYY-MM-DD' )
					}
				>
					{ visitsNumber } views this month
				</div>
			</div>
			Go to Stats page
		</div>
	);
}
