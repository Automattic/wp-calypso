/**
 * WordPress dependencies
 */
import { SVG, Circle } from '@wordpress/primitives';
import classnames from 'classnames';

export const PageControlIcon = ( { isSelected } ) => (
	<SVG width="8" height="8" fill="none" xmlns="http://www.w3.org/2000/svg">
		<Circle
			cx="4"
			cy="4"
			r="4"
			className={ classnames( 'icons__pageControl', {
				'is-selected': isSelected,
			} ) }
			fill={ isSelected ? '#419ECD' : '#E1E3E6' }
		/>
	</SVG>
);
