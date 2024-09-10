import { useTranslate, translate as i18nTranslate } from 'i18n-calypso';

export function useDataCenterOptions(): Record< string, ReturnType< typeof i18nTranslate > > {
	const translate = useTranslate();
	return {
		bur: translate( 'US West (Burbank, California)' ),
		dfw: translate( 'US Central (Dallas-Fort Worth, Texas)' ),
		dca: translate( 'US East (Washington, D.C.)' ),
		ams: translate( 'EU West (Amsterdam, Netherlands)' ),
	};
}
