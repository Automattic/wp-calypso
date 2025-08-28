import { __, sprintf } from '@wordpress/i18n';
import { useLocale } from '../../app/locale';
import { formatDate } from '../../utils/datetime';

export function useFormattedTime( timestamp: string, formatOptions?: Intl.DateTimeFormatOptions ) {
	const locale = useLocale();

	const date = new Date( timestamp );
	const formatted = formatDate( date, locale, formatOptions );

	if ( ! formatOptions?.dateStyle ) {
		const now = new Date();

		const isToday =
			date.getDate() === now.getDate() &&
			date.getMonth() === now.getMonth() &&
			date.getFullYear() === now.getFullYear();

		if ( isToday ) {
			// translators: time today
			return sprintf( __( 'Today at %s' ), formatted );
		}
		return formatDate( date, locale, { ...formatOptions, dateStyle: 'long' } );
	}

	return formatted;
}
