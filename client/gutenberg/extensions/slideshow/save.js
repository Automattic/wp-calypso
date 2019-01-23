/** @format */

/**
 * Internal dependencies
 */
import Slideshow from './slideshow';

export default ( { attributes: { align, effect, images }, className } ) => (
	<Slideshow align={ align } className={ className } effect={ effect } images={ images } />
);
