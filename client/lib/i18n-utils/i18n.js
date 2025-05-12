import i18nCalypso from 'i18n-calypso';

let i18n = i18nCalypso;

export const setI18n = ( currentI18n ) => {
	i18n = currentI18n;
};

export const getI18n = () => i18n;
