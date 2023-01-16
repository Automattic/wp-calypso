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
