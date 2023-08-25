import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { NAVIGATOR_PATHS } from '../constants';
import type { ScreenName } from '../types';

const useScreen = ( screenName: ScreenName, shouldUnlockGlobalStyles = false ) => {
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
			initialPath: NAVIGATOR_PATHS.UPSELL,
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

	const previousScreens = {
		main: null,
		styles: screens.main,
		upsell: screens.styles,
		activation: shouldUnlockGlobalStyles ? screens.upsell : screens.styles,
		confirmation: shouldUnlockGlobalStyles ? screens.upsell : screens.styles,
	};

	return {
		...screens[ screenName ],
		previousScreen: previousScreens[ screenName ],
	};
};

export default useScreen;
