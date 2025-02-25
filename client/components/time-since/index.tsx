interface TimeSinceProps {
	date: string;
	className?: string;
}

const rtf = new Intl.RelativeTimeFormat( 'default', {
	numeric: 'auto',
	style: 'narrow',
} );

const intervals = {
	week: 604800,
	day: 86400,
	hour: 3600,
	minute: 60,
} as const;

function getHumanTimeSince( date: string ): string {
	const timestamp = new Date( date ).getTime();
	const diffInSeconds = ( timestamp - Date.now() ) / 1000;

	// If older than a month, return formatted date
	if ( Math.abs( diffInSeconds ) > 2592000 ) {
		return new Intl.DateTimeFormat( 'default', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		} ).format( timestamp );
	}

	for ( const [ unit, secondsInUnit ] of Object.entries( intervals ) ) {
		const value = Math.round( diffInSeconds / secondsInUnit );
		if ( Math.abs( value ) >= 1 ) {
			return rtf.format( value, unit as Intl.RelativeTimeFormatUnit );
		}
	}

	return rtf.format( 0, 'second' );
}

function TimeSince( { className, date }: TimeSinceProps ) {
	const fullDate = new Intl.DateTimeFormat( 'default', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
	} ).format( new Date( date ) );

	const humanDate = getHumanTimeSince( date );

	return (
		<time className={ className } dateTime={ date } title={ fullDate }>
			{ humanDate }
		</time>
	);
}

export default TimeSince;
