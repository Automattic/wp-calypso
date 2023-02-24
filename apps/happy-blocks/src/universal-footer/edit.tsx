import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ColorPicker, Panel } from '@wordpress/components';
import PlaceholderFooter from './placeholder';
import type { FooterAttributes } from './types';
import type { BlockEditProps } from '@wordpress/blocks';

export default function Edit( { attributes, setAttributes }: BlockEditProps< FooterAttributes > ) {
	return (
		<>
			<InspectorControls>
				<Panel header="Footer Settings">
					<PanelBody title="Logo Color" initialOpen={ true }>
						<ColorPicker
							color={ attributes.logoColor }
							onChangeComplete={ ( color ) => setAttributes( { logoColor: color.hex } ) }
						/>
					</PanelBody>
				</Panel>
			</InspectorControls>

			<PlaceholderFooter logoColor={ attributes.logoColor } />
		</>
	);
}
