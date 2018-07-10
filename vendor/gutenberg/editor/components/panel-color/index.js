/**
 * External dependencies
 */
import { omit } from 'lodash';

/**
 * WordPress dependencies
 */
import { ifCondition, PanelColor as PanelColorComponent } from '@wordpress/components';
import { compose } from '@wordpress/element';

/**
 * Internal dependencies
 */
import ColorPalette from '../color-palette';
import withColorContext from '../color-palette/with-color-context';
import { getColorName } from '../colors';

function PanelColor( { colors, title, colorValue, initialOpen, ...props } ) {
	const colorName = getColorName( colors, colorValue );
	return (
		<PanelColorComponent { ...{ title, colorName, colorValue, initialOpen } } >
			<ColorPalette
				value={ colorValue }
				{ ...omit( props, [ 'disableCustomColors' ] ) }
			/>
		</PanelColorComponent>
	);
}

export default compose( [
	withColorContext,
	ifCondition( ( { hasColorsToChoose } ) => hasColorsToChoose ),
] )( PanelColor );
