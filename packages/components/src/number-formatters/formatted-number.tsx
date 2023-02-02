export default function formattedNumber( number: number | null ) {
	if ( Number.isFinite( number ) ) {
		// Safari 14 on Mojave can throw errors: https://github.com/google/site-kit-wp/issues/3255
		try {
			return Intl.NumberFormat().format( number as number );
		} catch {
			return '-';
		}
	}

	return '-';
}
