/**
 * WordPress dependencies.
 */
import { Path, SVG } from '@wordpress/components';

/**
 * External dependencies.
 */
import classnames from 'classnames';

export default ( { size = 24, className } ) => (
	<SVG
		className={ classnames( 'newspack-icon', className ) }
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
	>
		<Path
			className="newspack-icon__circle"
			fill="#36f"
			d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.372 12 12 12z"
		/>
		<Path
			className="newspack-icon__n"
			fill="#fff"
			d="M17.241 12.467h-1.29l-.827-.843h2.117v.843zm0-2.483h-3.727l-.826-.843h4.553v.843zm0-2.483h-6.163l-.827-.843h6.99v.843zm0 9.841L6.76 6.658v10.684h2.588v-4.484l4.4 4.484h3.494z"
		/>
	</SVG>
);
