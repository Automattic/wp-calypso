/**
 * Internal dependencies
 */
import { combineTours } from 'layout/guided-tours/config-elements';
import { MainTour } from 'layout/guided-tours/main-tour';
import { DesignShowcaseWelcomeTour } from 'layout/guided-tours/design-showcase-welcome-tour';
import { ThemeSheetTour } from 'layout/guided-tours/theme-sheet-tour';

export default combineTours( {
	main: MainTour,
	designShowcaseWelcome: DesignShowcaseWelcomeTour,
	theme: ThemeSheetTour,
} );
