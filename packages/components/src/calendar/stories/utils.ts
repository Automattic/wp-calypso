export function daysFromNow( days: number ) {
	const date = new Date();
	date.setDate( date.getDate() + days );
	return date;
}

export function isWeekend( date: Date ) {
	return date.getDay() === 0 || date.getDay() === 6;
}
