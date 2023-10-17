import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { NAVIGATOR_PATHS, INITIAL_CATEGORY } from '../constants';
import type { ScreenName } from '../types';

export type UseScreenOptions = {
	isNewSite?: boolean;
	shouldUnlockGlobalStyles?: boolean;
};

export type Screen = {
	name: string;
	title: string;
	description: string;
	continueLabel: string;
	/** The label for going back from the next screen */
	backLabel?: string;
	initialPath: string;
	previousScreen?: Screen | null;
	nextScreen?: Screen | null;
};

const useScreen = ( screenName: ScreenName, options: UseScreenOptions = {} ): Screen => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();
	const screens: Record< ScreenName, Screen > = {
		main: {
			name: 'main',
			title: hasEnTranslation( 'Select patterns' )
				? translate( 'Select patterns' )
				: translate( 'Select your patterns' ),
			description: translate( 'Create your homepage from our library of patterns.' )
				? translate( 'Create your homepage from our library of patterns.' )
				: translate(
						'Create your homepage by first adding patterns and then choosing a color palette and font style.'
				  ),
			continueLabel: hasEnTranslation( 'Select styles' )
				? translate( 'Select styles' )
				: translate( 'Pick your styles' ),
			backLabel: hasEnTranslation( 'patterns' ) ? translate( 'patterns' ) : undefined,
			initialPath: NAVIGATOR_PATHS.MAIN_HEADER,
		},
		sections: {
			name: 'sections',
			title: translate( 'Sections' ),
			description: hasEnTranslation(
				'Find the right patterns for you by exploring the list of categories below.'
			)
				? translate( 'Find the right patterns for you by exploring the list of categories below.' )
				: translate(
						'Find the section patterns for your homepage by exploring the categories below.'
				  ),
			continueLabel: translate( 'Save sections' ),
			initialPath: `${ NAVIGATOR_PATHS.SECTIONS }/${ INITIAL_CATEGORY }`,
		},
		styles: {
			name: 'styles',
			title: hasEnTranslation( 'Select styles' )
				? translate( 'Select styles' )
				: translate( 'Pick your styles' ),
			description: hasEnTranslation(
				'Add style to your page with our expertly curated color palettes and font pairings.'
			)
				? translate(
						'Add style to your page with our expertly curated color palettes and font pairings.'
				  )
				: translate(
						'Create your homepage by first adding patterns and then choosing a color palette and font style.'
				  ),
			continueLabel: translate( 'Save and continue' ),
			backLabel: hasEnTranslation( 'styles' ) ? translate( 'styles' ) : undefined,
			initialPath: NAVIGATOR_PATHS.STYLES_COLORS,
		},
		upsell: {
			name: 'upsell',
			title: translate( 'Premium styles' ),
			description: translate( "You've chosen a premium style and action is required." ),
			continueLabel: translate( 'Continue' ),
			backLabel: hasEnTranslation( 'premium styles' ) ? translate( 'premium styles' ) : undefined,
			initialPath: NAVIGATOR_PATHS.UPSELL,
		},
		activation: {
			name: 'activation',
			title: translate( 'Activate this theme' ),
			description: translate( 'Activating this theme will result in the following changes.' ),
			continueLabel: translate( 'Activate' ),
			initialPath: NAVIGATOR_PATHS.ACTIVATION,
		},
		confirmation: {
			name: 'confirmation',
			title: translate( 'Great job!' ),
			description: translate( 'Time to add some content and bring your site to life!' ),
			continueLabel: translate( 'Start adding content' ),
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
