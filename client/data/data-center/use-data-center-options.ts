import { useTranslate } from 'i18n-calypso';

export const useDataCenterOptions = () => {
	const translate = useTranslate();
	return {
		bur: translate( 'US West (Burbank, California)' ),
		dfw: translate( 'US Central (Dallas-Fort Worth, Texas)' ),
		dca: translate( 'US East (Washington, D.C.)' ),
		ams: translate( 'EU West (Amsterdam, Netherlands)' ),
	};
};
