export const withLocale = ( url: string, locale: string ) => {
	return locale && locale !== 'en' ? `${ url }/${ locale }` : url;
};
