export const formatDate = ( dateString: string | undefined ) => {
	if ( ! dateString ) {
		return '';
	}
	const date = new Date( dateString );
	return date.toLocaleDateString( 'en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	} );
};
