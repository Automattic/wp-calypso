import { useSiteSettings } from './use-site-settings';

export function useSiteDateTimeFormat( siteSlug: string ) {
	const { getSiteSetting } = useSiteSettings( siteSlug );
	const dateFormat = getSiteSetting( 'date_format' );
	const timeFormat = getSiteSetting( 'time_format' );

	const isAmPmPhpTimeFormat = ( formatString: string ) => {
		// Regular expression to check for AM/PM indicators
		const ampmRegex = /(a|A)/;

		return ampmRegex.test( formatString );
	};

	return {
		dateFormat,
		timeFormat,
		isAmPmPhpTimeFormat,
	};
}
