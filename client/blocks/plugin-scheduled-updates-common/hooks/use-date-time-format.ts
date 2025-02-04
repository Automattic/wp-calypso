import { useLocalizedMoment } from 'calypso/components/localized-moment';
import {
	phpToMomentDatetimeFormat,
	phpToMomentMapping,
} from 'calypso/my-sites/site-settings/date-time-format/utils';
import { useSiteSettings } from '../../plugins-scheduled-updates/hooks/use-site-settings';

export function useDateTimeFormat( siteSlug?: string ) {
	const moment = useLocalizedMoment();
	const { getSiteSetting } = useSiteSettings( siteSlug );

	// Returns the current datetime format based on the locale in PHP format
	const getDateTimeFormatFromLocale = ( locale: string ) => {
		const dateFormatter = new Intl.DateTimeFormat( locale, { dateStyle: 'long' } );
		const timeFormatter = new Intl.DateTimeFormat( locale, { timeStyle: 'short' } );

		const dateFormat = dateFormatter
			.formatToParts( new Date() )
			.map( ( part ) => {
				switch ( part.type ) {
					case 'day':
						return 'd';
					case 'month':
						return 'M';
					case 'year':
						return 'Y';
					default:
						return part.value;
				}
			} )
			.join( '' );

		const timeFormat = timeFormatter
			.formatToParts( new Date() )
			.map( ( part ) => {
				switch ( part.type ) {
					case 'hour':
						return 'H';
					case 'minute':
						return 'i';
					case 'second':
						return 's';
					case 'dayPeriod':
						return '';
					default:
						return part.value;
				}
			} )
			.join( '' );

		return {
			dateFormat,
			timeFormat,
		};
	};

	const { dateFormat, timeFormat } = siteSlug
		? {
				dateFormat: getSiteSetting( 'date_format' ),
				timeFormat: getSiteSetting( 'time_format' ),
		  }
		: getDateTimeFormatFromLocale( moment.locale() );

	const phpToMomentMap = phpToMomentMapping as {
		[ key: string ]: string;
	};

	function convertPhpToMomentFormat( phpFormat: string ): string {
		let momentFormat = '';

		for ( let i = 0; i < phpFormat.length; i++ ) {
			const char = phpFormat.charAt( i );
			if ( phpToMomentMap[ char ] ) {
				momentFormat += phpToMomentMap[ char ];
			} else {
				momentFormat += char;
			}
		}

		return momentFormat;
	}

	// Prepare timestamp based on site settings
	const prepareTime = ( unixTimestamp: number ) => {
		const ts = unixTimestamp * 1000;

		return phpToMomentDatetimeFormat( moment( ts ), timeFormat );
	};

	// Prepare timestamp based on site settings
	const prepareDateTime = ( unixTimestamp: number, customPhpDateFormat?: string ) => {
		const ts = unixTimestamp * 1000;
		const format = `${ customPhpDateFormat || dateFormat } ${ timeFormat }`;

		return phpToMomentDatetimeFormat( moment( ts ), format );
	};

	const isAmPmPhpTimeFormat = () => {
		// Regular expression to check for AM/PM indicators
		const ampmRegex = /(a|A)/;

		return ampmRegex.test( timeFormat );
	};

	return {
		dateFormat,
		timeFormat,
		prepareTime,
		prepareDateTime,
		isAmPmPhpTimeFormat,
		convertPhpToMomentFormat,
	};
}
