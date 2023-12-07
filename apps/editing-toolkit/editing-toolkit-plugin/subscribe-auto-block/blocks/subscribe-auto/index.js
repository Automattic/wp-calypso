import { InspectorControls } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { Placeholder, PanelBody } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';

import './editor.scss';
import './style.scss';

const icon = (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<path opacity=".87" fill="none" d="M0 0h24v24H0V0z" />
		<path d="M3 5v14h17V5H3zm4 2v2H5V7h2zm-2 6v-2h2v2H5zm0 2h2v2H5v-2zm13 2H9v-2h9v2zm0-4H9v-2h9v2zm0-4H9V7h9v2z" />
	</svg>
);

registerBlockType( metadata.name, {
	title: __( 'Subscribe Auto Block', 'full-site-editing' ),
	description: __( 'Automatically inserts subsribe block on your site.', 'full-site-editing' ),
	icon: icon,
	category: 'layout',
	supports: {
		html: false,
		multiple: true,
		reusable: true,
		inserter: true,
	},
	attributes: metadata.attributes,
	edit: () => {
		return (
			<Fragment>
				<Placeholder
					icon={ icon }
					label={ __( 'Your subscribe block will be displayed here.', 'full-site-editing' ) }
				>
					This is a placeholder for subscribe block.
				</Placeholder>
				<InspectorControls>
					<PanelBody>This is the panel body</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	},
	save: () => null,
} );
