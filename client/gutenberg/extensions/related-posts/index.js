/** @format */

/**
 * External dependencies
 */
import wp from 'wp';

/**
 * WordPress dependencies
 */
const { __ } = wp.i18n;
const { Fragment } = wp.element;
const { InspectorControls } = wp.editor;
const { PanelBody, RangeControl } = wp.components;
const { registerBlockType } = wp.blocks;

/**
 * Module variables
 */
const MAX_POSTS_TO_SHOW = 3;

registerBlockType( 'jetpack/related-posts', {
	title: 'Related Posts',

	icon: 'admin-post',

	category: 'layout',

	attributes: {
		postsToShow: {
			type: 'number',
			default: 3,
		},
	},

	edit: ( { attributes, setAttributes } ) => {
		const { postsToShow } = attributes;

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Related Posts Settings' ) }>
						<RangeControl
							label={ __( 'Number of posts' ) }
							value={ postsToShow }
							onChange={ value => setAttributes( { postsToShow: value } ) }
							min={ 1 }
							max={ MAX_POSTS_TO_SHOW }
						/>
					</PanelBody>
				</InspectorControls>

				<div>List of posts here</div>
			</Fragment>
		);
	},
	save: () => null,
} );
