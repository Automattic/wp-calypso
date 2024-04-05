import { useLocalizedMoment } from 'calypso/components/localized-moment';
import {
	phpToMomentDatetimeFormat,
	phpToMomentMapping,
} from 'calypso/my-sites/site-settings/date-time-format/utils';
import { useSiteSettings } from './use-site-settings';

export function useSiteDateTimeFormat( siteSlug: string ) {
	const moment = useLocalizedMoment();
	const { getSiteSetting } = useSiteSettings( siteSlug );
	const dateFormat = getSiteSetting( 'date_format' );
	const timeFormat = getSiteSetting( 'time_format' );
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
	const prepareDateTime = ( unixTimestamp: number ) => {
		const ts = unixTimestamp * 1000;
		const format = `${ dateFormat } ${ timeFormat }`;

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
