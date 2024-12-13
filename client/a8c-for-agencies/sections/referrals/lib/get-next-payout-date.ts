const PAYOUT_SCHEDULE = {
	Q1: { start: '01-01', end: '03-31', payoutDate: '06-01' },
	Q2: { start: '04-01', end: '06-30', payoutDate: '09-01' },
	Q3: { start: '07-01', end: '09-30', payoutDate: '12-01' },
	Q4: { start: '10-01', end: '12-31', payoutDate: '03-01' }, // Next year
};

export const getNextPayoutDate = ( currentDate: Date ): Date => {
	const currentMonth = currentDate.getMonth() + 1; // Convert to 1-based month
	const currentYear = currentDate.getFullYear();

	// Find which quarter we're in
	const quarterKey = Object.keys( PAYOUT_SCHEDULE ).find( ( quarter ) => {
		const schedule = PAYOUT_SCHEDULE[ quarter as keyof typeof PAYOUT_SCHEDULE ];
		const [ startMonth ] = schedule.start.split( '-' ).map( Number );
		const [ endMonth ] = schedule.end.split( '-' ).map( Number );
		return currentMonth >= startMonth && currentMonth <= endMonth;
	} ) as keyof typeof PAYOUT_SCHEDULE;

	// Get payout month and day
	const [ payoutMonth, payoutDay ] = PAYOUT_SCHEDULE[ quarterKey ].payoutDate
		.split( '-' )
		.map( Number );

	// Calculate payout year (next year if we're in Q4)
	const payoutYear = quarterKey === 'Q4' ? currentYear + 1 : currentYear;

	return new Date( payoutYear, payoutMonth - 1, payoutDay );
};
