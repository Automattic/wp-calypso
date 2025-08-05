export const HOSTNAME_REGEX =
	/^(?=.{1,255}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export const validateHostname = ( hostname: string ) => {
	return HOSTNAME_REGEX.test( hostname );
};
