/** @format */

/**
 * Internal dependencies
 */
import Slideshow from './slideshow';

export default ( { attributes: { align, aspectRatio, effect, images }, className } ) => (
	<Slideshow
		align={ align }
		aspectRatio={ aspectRatio }
		className={ className }
		effect={ effect }
		images={ images }
	/>
);
