/**
 * Internal dependencies
 */
import { combineTours } from 'layout/guided-tours/config-elements';
import { MainTour } from 'layout/guided-tours/main-tour';
import { DesignShowcaseWelcomeTour } from 'layout/guided-tours/design-showcase-welcome-tour';
import { ThemeSheetWelcomeTour } from 'layout/guided-tours/theme-sheet-welcome-tour';

export default combineTours( {
	main: MainTour,
	designShowcaseWelcome: DesignShowcaseWelcomeTour,
	themeSheetWelcomeTour: ThemeSheetWelcomeTour,
} );
