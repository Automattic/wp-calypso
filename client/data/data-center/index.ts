import { __ } from '@wordpress/i18n';

export const getDataCenterOptions = () => {
	return {
		bur: __( 'US West (Burbank, California)' ),
		dfw: __( 'US Central (Dallas-Fort Worth, Texas)' ),
		dca: __( 'US East (Washington, D.C.)' ),
		ams: __( 'EU West (Amsterdam, Netherlands)' ),
	};
};
