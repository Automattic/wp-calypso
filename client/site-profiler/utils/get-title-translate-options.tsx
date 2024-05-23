import { TranslateOptions } from 'i18n-calypso';

export const getTitleTranslateOptions = (): TranslateOptions => {
	return {
		components: {
			success: <span className="success" />,
			alert: <span className="alert" />,
		},
	};
};
