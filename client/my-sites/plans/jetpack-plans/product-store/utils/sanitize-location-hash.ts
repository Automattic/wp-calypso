export const sanitizeLocationHash = ( value: string ) => {
	// Location hash value can contain only english alphanumeric characters and underscores
	return value.replace( /[^a-z0-9_]/gi, '' );
};
