const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const RELATIVE_WINDOW = 5 * DAY;

/** Converts a WordPress.com locale slug to one Intl accepts. */
function getIntlLocale( locale: string ) {
	const tag = locale.replace( /_/g, '-' );

	try {
		Intl.getCanonicalLocales( tag );
		return tag;
	} catch {
		return 'en';
	}
}

export function formatNoteTime( timestamp: string, locale: string, now = Date.now() ) {
	const date = new Date( timestamp );
	const elapsed = now - date.getTime();

	if ( elapsed >= RELATIVE_WINDOW ) {
		return new Intl.DateTimeFormat( getIntlLocale( locale ), { dateStyle: 'medium' } ).format(
			date
		);
	}

	const relative = new Intl.RelativeTimeFormat( getIntlLocale( locale ), { numeric: 'auto' } );
	if ( elapsed < HOUR ) {
		return relative.format( -Math.round( elapsed / MINUTE ), 'minute' );
	}
	if ( elapsed < DAY ) {
		return relative.format( -Math.round( elapsed / HOUR ), 'hour' );
	}
	return relative.format( -Math.round( elapsed / DAY ), 'day' );
}

export const formatFullTime = ( timestamp: string, locale: string ) =>
	new Intl.DateTimeFormat( getIntlLocale( locale ), {
		dateStyle: 'long',
		timeStyle: 'short',
	} ).format( new Date( timestamp ) );

export const formatDate = ( timestamp: string, locale: string ) =>
	new Intl.DateTimeFormat( getIntlLocale( locale ), { dateStyle: 'medium' } ).format(
		new Date( timestamp )
	);
