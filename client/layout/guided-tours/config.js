/**
 * Internal dependencies
 */
import { combineTours } from 'layout/guided-tours/config-elements';
import { MainTour } from 'layout/guided-tours/main-tour';
import { DesignShowcaseTour } from 'layout/guided-tours/design-showcase-tour';

export default combineTours( {
	main: MainTour,
	designShowcase: DesignShowcaseTour,
} );
