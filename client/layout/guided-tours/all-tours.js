/** @ssr-ready **/

/**
 * Internal dependencies
 */
import { combineTours } from 'layout/guided-tours/config-elements';
import { MainTour } from 'layout/guided-tours/main-tour';

// move to guided-tours/config or something
export default combineTours( {
	main: MainTour,
} );
