/**
 * External dependencies
 */
import { Path, Polygon, SVG } from '@wordpress/components';

const JetpackLogo = () => (
	<SVG
		className="jetpack-logo"
		xmlns="http://www.w3.org/2000/svg"
		width="32"
		height="32"
		viewBox="0 0 32 32"
	>
		<Path
			className="jetpack-logo__icon-circle"
			fill="#00be28"
			d="M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z"
		/>
		<Polygon className="jetpack-logo__icon-triangle" fill="#fff" points="15,19 7,19 15,3 " />
		<Polygon className="jetpack-logo__icon-triangle" fill="#fff" points="17,29 17,13 25,13 " />
	</SVG>
);

export default JetpackLogo;
