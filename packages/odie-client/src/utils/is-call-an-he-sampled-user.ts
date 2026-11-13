const CALL_AN_HE_BOT_EMAIL_DOMAIN = '@automattic.com';
// 5% = 1/20 is sampled for the experiment
const SAMPLE_RATE = 20;
export const isCallAnHESampledUser = ( user?: { ID?: number; email?: string } ): boolean => {
	if ( ! user || ! user.ID ) {
		return false;
	}

	if ( user.ID % SAMPLE_RATE === 0 ) {
		return true;
	}

	if ( user.email?.toLowerCase().endsWith( CALL_AN_HE_BOT_EMAIL_DOMAIN ) ) {
		return true;
	}

	return false;
};
