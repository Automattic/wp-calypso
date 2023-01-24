import { translate } from 'i18n-calypso';
import moment from 'moment/moment';

export function rangeOfPeriod( period, date ) {
	const periodRange = {
		period: period,
		startOf: date.clone().startOf( period ),
		endOf: date.clone().endOf( period ),
	};

	if ( 'week' === period ) {
		if ( '0' === date.format( 'd' ) ) {
			periodRange.startOf.subtract( 6, 'd' );
			periodRange.endOf.subtract( 6, 'd' );
		} else {
			periodRange.startOf.add( 1, 'd' );
			periodRange.endOf.add( 1, 'd' );
		}
	}

	periodRange.key = period + ':' + periodRange.endOf.format( 'YYYY-MM-DD' );

	return periodRange;
}

export function getPeriodWithFallback( period, date, isValidStartDate, fallbackDate ) {
	if ( ! isValidStartDate && fallbackDate ) {
		const fallbackDateMoment = moment( fallbackDate ).locale( 'en' );
		const postPeriod = rangeOfPeriod( period.period, fallbackDateMoment );
		return { period: postPeriod, date: postPeriod.startOf, hasValidDate: true };
	} else if ( ! isValidStartDate && ! fallbackDate ) {
		return { period: period, date: date, hasValidDate: false };
	}

	return { period, date, hasValidDate: true };
}

export function getCharts( statType ) {
	const charts = {
		opens: [
			{
				attr: 'opens_count',
				legendOptions: [],
				icon: (
					<svg
						className="gridicon"
						width="24"
						height="24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="m4 13 .67.336.003-.005a2.42 2.42 0 0 1 .094-.17c.071-.122.18-.302.329-.52.298-.435.749-1.017 1.359-1.598C7.673 9.883 9.498 8.75 12 8.75s4.326 1.132 5.545 2.293c.61.581 1.061 1.163 1.36 1.599a8.29 8.29 0 0 1 .422.689l.002.005L20 13l.67-.336v-.003l-.003-.005-.008-.015-.028-.052a9.752 9.752 0 0 0-.489-.794 11.6 11.6 0 0 0-1.562-1.838C17.174 8.617 14.998 7.25 12 7.25S6.827 8.618 5.42 9.957c-.702.669-1.22 1.337-1.563 1.839a9.77 9.77 0 0 0-.516.845l-.008.015-.002.005-.001.002v.001L4 13Zm8 3a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
							fill="#00101C"
						/>
					</svg>
				),
				label: translate( 'Opens', { context: 'noun' } ),
			},
		],
		clicks: [
			{
				attr: 'clicks',
				legendOptions: [],
				icon: (
					<svg
						className="gridicon"
						width="24"
						height="24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="m4 13 .67.336.003-.005a2.42 2.42 0 0 1 .094-.17c.071-.122.18-.302.329-.52.298-.435.749-1.017 1.359-1.598C7.673 9.883 9.498 8.75 12 8.75s4.326 1.132 5.545 2.293c.61.581 1.061 1.163 1.36 1.599a8.29 8.29 0 0 1 .422.689l.002.005L20 13l.67-.336v-.003l-.003-.005-.008-.015-.028-.052a9.752 9.752 0 0 0-.489-.794 11.6 11.6 0 0 0-1.562-1.838C17.174 8.617 14.998 7.25 12 7.25S6.827 8.618 5.42 9.957c-.702.669-1.22 1.337-1.563 1.839a9.77 9.77 0 0 0-.516.845l-.008.015-.002.005-.001.002v.001L4 13Zm8 3a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
							fill="#00101C"
						/>
					</svg>
				),
				label: translate( 'Clicks', { context: 'noun' } ),
			},
		],
	};

	return charts[ statType ];
}
