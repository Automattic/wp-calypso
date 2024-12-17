const PAYOUT_DATES = [
	{ month: 3, day: 2 }, // March 2
	{ month: 6, day: 1 }, // June 1
	{ month: 9, day: 1 }, // September 1
	{ month: 12, day: 1 }, // December 1
];

export const getNextPayoutDate = ( currentDate: Date ): Date => {
	const currentYear = currentDate.getFullYear();
	const currentMonth = currentDate.getMonth() + 1; // Convert to 1-based month
	const currentDay = currentDate.getDate();

	// Find the next payout date that's closest to current date
	const nextPayout = PAYOUT_DATES.find( ( { month, day } ) => {
		return month > currentMonth || ( month === currentMonth && day > currentDay );
	} );

	if ( nextPayout ) {
		return new Date( currentYear, nextPayout.month - 1, nextPayout.day );
	}

	// If no payout dates left this year, return first payout of next year
	return new Date( currentYear + 1, PAYOUT_DATES[ 0 ].month - 1, PAYOUT_DATES[ 0 ].day );
};
