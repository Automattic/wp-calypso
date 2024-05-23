import { TranslateOptions } from 'i18n-calypso';

export const getTitleTranslateOptions = (): TranslateOptions => {
	return {
		components: {
			good: <span className="good" />,
			poor: <span className="poor" />,
		},
	};
};
