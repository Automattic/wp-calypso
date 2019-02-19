/**
 * Internal dependencies
 */
import Slideshow from './slideshow';

export default ( { attributes: { align, autoplay, delay, effect, images }, className } ) => (
	<Slideshow
		align={ align }
		autoplay={ autoplay }
		className={ className }
		delay={ delay }
		effect={ effect }
		images={ images }
	/>
);
