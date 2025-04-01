export const formatDate = ( locale: string, date: Date ) => {
	return Intl.DateTimeFormat( locale, { dateStyle: 'medium' } ).format( date );
};
