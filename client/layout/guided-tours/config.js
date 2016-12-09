/**
 * Internal dependencies
 */
import { combineTours } from 'layout/guided-tours/config-elements';
import { MainTour } from 'layout/guided-tours/tours/main-tour';
import { DesignShowcaseWelcomeTour } from 'layout/guided-tours/tours/design-showcase-welcome-tour';
import { ThemeSheetWelcomeTour } from 'layout/guided-tours/tours/theme-sheet-welcome-tour';
import { SiteTitleTour } from 'layout/guided-tours/tours/site-title-tour';
import { EditorInsertMenuTour } from 'layout/guided-tours/tours/editor-insert-menu-tour';

export default combineTours( {
	main: MainTour,
	designShowcaseWelcome: DesignShowcaseWelcomeTour,
	themeSheetWelcomeTour: ThemeSheetWelcomeTour,
	siteTitle: SiteTitleTour,
	editorInsertMenu: EditorInsertMenuTour,
} );
