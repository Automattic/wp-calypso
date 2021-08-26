import config from '@automattic/calypso-config';

const getCalendlyURL = (): string | null => {
	const url = config< string >( 'calendly_jetpack_appointment_url' );

	return url ? url : null;
};

export default getCalendlyURL;
