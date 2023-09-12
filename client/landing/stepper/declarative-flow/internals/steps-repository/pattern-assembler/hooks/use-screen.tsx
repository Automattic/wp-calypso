import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { NAVIGATOR_PATHS, INITIAL_CATEGORY } from '../constants';
import type { ScreenName } from '../types';

export type UseScreenOptions = {
	isNewSite?: boolean;
	shouldUnlockGlobalStyles?: boolean;
};

const useScreen = ( screenName: ScreenName, options: UseScreenOptions = {} ) => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const screens = {
		main: {
			name: 'main',
			title: translate( 'Design your own' ),
			initialPath: NAVIGATOR_PATHS.MAIN_HEADER,
		},
		sections: {
			name: 'sections',
			title: translate( 'Sections' ),
			initialPath: `${ NAVIGATOR_PATHS.SECTIONS }/${ INITIAL_CATEGORY }`,
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
		sections: screens.main,
		styles: screens.main,
		upsell: screens.styles,
		activation: options.shouldUnlockGlobalStyles ? screens.upsell : screens.styles,
		confirmation: options.shouldUnlockGlobalStyles ? screens.upsell : screens.styles,
	};

	const nextScreens = {
		main: screens.styles,
		sections: screens.main,
		styles: ( () => {
			if ( options.shouldUnlockGlobalStyles ) {
				return screens.upsell;
			}

			return options.isNewSite ? screens.confirmation : screens.activation;
		} )(),
		upsell: options.isNewSite ? screens.confirmation : screens.activation,
		activation: null,
		confirmation: null,
	};

	return {
		...screens[ screenName ],
		previousScreen: previousScreens[ screenName ],
		nextScreen: nextScreens[ screenName ],
	};
};

export default useScreen;
