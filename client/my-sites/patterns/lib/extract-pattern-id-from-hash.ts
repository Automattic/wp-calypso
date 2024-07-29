export const extractPatternIdFromHash = () => {
	const pattern = /^#pattern-(\d+)$/;
	const match = window.location.hash.match( pattern );

	if ( match ) {
		return parseInt( match[ 1 ], 10 );
	}

	return undefined;
};
