/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';
import PanelBody from './body';

function PanelColor( { colorValue, colorName, title, ...props } ) {
	// translators: %s: The name of the color e.g: "vivid red" or color hex code if name is not available e.g: "#f00".
	const currentColorLabel = sprintf( __( '(current color: %s)' ), colorName || colorValue );
	return (
		<PanelBody
			{ ...props }
			title={ [
				<span className="components-panel__color-title" key="title">{ title }</span>,
				colorValue && (
					<span className="components-panel__color-area" aria-label={ currentColorLabel } key="color" style={ { background: colorValue } } />
				),
			] }
		/>
	);
}

export default PanelColor;
