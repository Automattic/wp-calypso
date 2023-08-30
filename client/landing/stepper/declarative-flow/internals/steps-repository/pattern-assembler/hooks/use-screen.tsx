import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { NAVIGATOR_PATHS } from '../constants';
import type { ScreenName } from '../types';

const useScreen = ( screenName: ScreenName ) => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const screens = {
		main: {
			name: 'main',
			title: translate( 'Design your own' ),
			initialPath: NAVIGATOR_PATHS.MAIN_HEADER,
		},
		styles: {
			name: 'styles',
			title: hasEnTranslation( 'Pick your style' )
				? translate( 'Pick your style' )
				: translate( 'Styles' ),
			initialPath: NAVIGATOR_PATHS.STYLES_COLORS,
		},
		upsell: {
			name: 'upsell',
			title: translate( 'Custom styles' ),
		},
		activation: {
			name: 'activation',
			title: translate( 'Activate this theme' ),
			initialPath: NAVIGATOR_PATHS.ACTIVATION,
		},
		confirmation: {
			name: 'confirmation',
			title: translate( 'Great job!' ),
			initialPath: NAVIGATOR_PATHS.CONFIRMATION,
		},
	};

	/** @todo Handle the upsell screen in the following PR */
	const previousScreens = {
		main: null,
		styles: screens.main,
		upsell: screens.styles,
		activation: screens.styles,
		confirmation: screens.styles,
	};

	return {
		...screens[ screenName ],
		previousScreen: previousScreens[ screenName ],
	};
};

export default useScreen;
