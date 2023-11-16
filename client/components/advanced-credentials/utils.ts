const getHostMatch = ( host: string ) => {
	const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+)(\/.*)?$/;
	return host.match( urlPattern );
};

export const getHostInput = ( host: string ) => {
	const match = getHostMatch( host );
	return match?.[ 2 ] || '';
};

export const checkHostInput = ( host: string ) => {
	const match = getHostMatch( host );
	return !! match?.[ 2 ];
};
