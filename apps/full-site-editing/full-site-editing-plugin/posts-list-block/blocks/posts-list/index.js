/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { Placeholder, RangeControl, PanelBody } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/editor';

/**
 * Internal dependencies
 */
import * as metadata from './block.json';
import './style.scss';

const icon = (
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
		<path opacity=".87" fill="none" d="M0 0h24v24H0V0z" />
		<path d="M3 5v14h17V5H3zm4 2v2H5V7h2zm-2 6v-2h2v2H5zm0 2h2v2H5v-2zm13 2H9v-2h9v2zm0-4H9v-2h9v2zm0-4H9V7h9v2z" />
	</svg>
);

registerBlockType( metadata.name, {
	title: __( 'Blog Posts Listing', 'full-site-editing' ),
	description: __( 'Displays your latest Blog Posts.', 'full-site-editing' ),
	icon: icon,
	category: 'layout',
	supports: {
		html: false,
		multiple: false,
		reusable: false,
	},
	attributes: metadata.attributes,
	edit: ( { attributes, setAttributes, isSelected } ) => (
		<Fragment>
			<Placeholder
				icon={ icon }
				label={ __( 'Your recent blog posts will be displayed here.', 'full-site-editing' ) }
			>
				{ isSelected ? (
					<RangeControl
						label={ __( 'Number of posts to show', 'full-site-editing' ) }
						value={ attributes.postsPerPage }
						onChange={ val => setAttributes( { postsPerPage: val } ) }
						min={ 1 }
						max={ 50 }
					/>
				) : null }
			</Placeholder>
			<InspectorControls>
				<PanelBody>
					<RangeControl
						label={ __( 'Number of posts', 'full-site-editing' ) }
						value={ attributes.postsPerPage }
						onChange={ val => setAttributes( { postsPerPage: val } ) }
						min={ 1 }
						max={ 50 }
					/>
				</PanelBody>
			</InspectorControls>
		</Fragment>
	),
	save: () => null,
} );
