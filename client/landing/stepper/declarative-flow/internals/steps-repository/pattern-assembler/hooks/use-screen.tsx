import { isEnabled } from '@automattic/calypso-config';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { NAVIGATOR_PATHS } from '../constants';
import type { ScreenName } from '../types';

export type UseScreenOptions = {
	isNewSite?: boolean;
	shouldUnlockGlobalStyles?: boolean;
};

export type Screen = {
	name: string;
	title: string;
	description: TranslateResult;
	continueLabel: string;
	/** The label for going back from the next screen */
	backLabel?: string;
	initialPath: string;
	previousScreen?: Screen | null;
	nextScreen?: Screen | null;
};

const useScreen = ( screenName: ScreenName, options: UseScreenOptions = {} ): Screen => {
	const isAddPagesEnabled = isEnabled( 'pattern-assembler/add-pages' );
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
			continueLabel: isAddPagesEnabled
				? translate( 'Select pages' )
				: translate( 'Save and continue' ),
			backLabel: hasEnTranslation( 'styles' ) ? translate( 'styles' ) : undefined,
			initialPath: NAVIGATOR_PATHS.STYLES_COLORS,
		},
		pages: {
			name: 'pages',
			title: translate( 'Add more pages' ),
			description: translate(
				"We've pre-selected common pages for your site. You can add more pages or unselect the current ones.{{br/}}{{br/}}Page content can be edited later, in the Site Editor.",
				{
					components: {
						br: <br />,
					},
				}
			),
			continueLabel: translate( 'Save and continue' ),
			backLabel: translate( 'pages' ),
			initialPath: NAVIGATOR_PATHS.PAGES,
		},
		upsell: {
			name: 'upsell',
			title: translate( 'Premium styles' ),
			description: translate(
				"You've chosen premium styles which are exclusive to the Premium plan or higher."
			),
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
		styles: screens.main,
		pages: screens.styles,
		upsell: isAddPagesEnabled ? screens.pages : screens.styles,
		activation: ( () => {
			if ( options.shouldUnlockGlobalStyles ) {
				return screens.upsell;
			}

			return isAddPagesEnabled ? screens.pages : screens.styles;
		} )(),
		confirmation: ( () => {
			if ( options.shouldUnlockGlobalStyles ) {
				return screens.upsell;
			}

			return isAddPagesEnabled ? screens.pages : screens.styles;
		} )(),
	};

	const nextScreens = {
		main: screens.styles,
		styles: ( () => {
			if ( isAddPagesEnabled ) {
				return screens.pages;
			}

			if ( options.shouldUnlockGlobalStyles ) {
				return screens.upsell;
			}

			return options.isNewSite ? screens.confirmation : screens.activation;
		} )(),
		pages: ( () => {
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
