/**
 * Internal dependencies
 */
import { combineTours } from 'layout/guided-tours/config-elements';
import { MainTour } from 'layout/guided-tours/main-tour';
import { DesignTour } from 'layout/guided-tours/design-tour';
import { ThemeTour } from 'layout/guided-tours/theme-tour';

export default combineTours( {
	main: MainTour,
	design: DesignTour,
	theme: ThemeTour,
} );
