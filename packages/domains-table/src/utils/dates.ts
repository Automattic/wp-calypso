export const formatDate = ( localeSlug: string, date: string | number ) => {
	return new Intl.DateTimeFormat( localeSlug, { dateStyle: 'medium' } ).format( new Date( date ) );
};
