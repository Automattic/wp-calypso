
/**
 * External dependencies
 */
import { isEmpty } from 'lodash';

/**
 * WordPress dependencies
 */
import { createHigherOrderComponent } from '@wordpress/element';
import { withSelect } from '@wordpress/data';

export default createHigherOrderComponent(
	withSelect(
		( select ) => {
			const settings = select( 'core/editor' ).getEditorSettings();
			const colors = settings.colors;
			const disableCustomColors = settings.disableCustomColors;
			return {
				colors,
				disableCustomColors,
				hasColorsToChoose: ! isEmpty( colors ) || ! disableCustomColors,
			};
		}
	),
	'withColorContext'
);
