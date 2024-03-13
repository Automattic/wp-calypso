import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { phpToMomentDatetimeFormat } from 'calypso/my-sites/site-settings/date-time-format/utils';
import { useSiteSettings } from './use-site-settings';

export function useSiteDateTimeFormat( siteSlug: string ) {
	const moment = useLocalizedMoment();
	const { getSiteSetting } = useSiteSettings( siteSlug );
	const dateFormat = getSiteSetting( 'date_format' );
	const timeFormat = getSiteSetting( 'time_format' );

	const prepareTimestamp = ( unixTimestamp: number ) => {
		const ts = unixTimestamp * 1000;
		const format = `${ dateFormat } ${ timeFormat }`;

		return phpToMomentDatetimeFormat( moment( ts ), format );
	};

	const isAmPmPhpTimeFormat = ( formatString: string ) => {
		// Regular expression to check for AM/PM indicators
		const ampmRegex = /(a|A)/;

		return ampmRegex.test( formatString );
	};

	return {
		dateFormat,
		timeFormat,
		prepareTimestamp,
		isAmPmPhpTimeFormat,
	};
}
