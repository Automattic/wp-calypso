import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ColorPicker, Panel } from '@wordpress/components';
import PlaceholderHeader from './placeholder';
import type { HeaderAttributes } from './types';
import type { BlockEditProps } from '@wordpress/blocks';

export default function Edit( { attributes, setAttributes }: BlockEditProps< HeaderAttributes > ) {
	return (
		<>
			<InspectorControls>
				<Panel header="Header Settings">
					<PanelBody title="Logo Color" initialOpen={ true }>
						<ColorPicker
							color={ attributes.logoColor }
							onChangeComplete={ ( color ) => setAttributes( { logoColor: color.hex } ) }
						/>
					</PanelBody>
				</Panel>
			</InspectorControls>

			<PlaceholderHeader logoColor={ attributes.logoColor } />
		</>
	);
}
