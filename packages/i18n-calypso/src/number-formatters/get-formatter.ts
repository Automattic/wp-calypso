const formatterCache = new Map();

interface Params {
	locale: string;
	options?: Intl.NumberFormatOptions;
}

export default function getFormatter( { locale, options }: Params ): Intl.NumberFormat {
	const key = JSON.stringify( [ locale, options ] );

	if ( ! formatterCache.has( key ) ) {
		formatterCache.set( key, new Intl.NumberFormat( locale, options ) );
	}

	return formatterCache.get( key );
}
