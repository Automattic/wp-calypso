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
const { BlockControls, InspectorControls } = wp.editor;
const { PanelBody, RangeControl, TextControl, ToggleControl, Toolbar } = wp.components;
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
		postLayout: {
			type: 'string',
			default: 'grid',
		},
		headline: {
			type: 'string',
			default: __( 'Related' ),
		},
		displayDate: {
			type: 'boolean',
			default: true,
		},
		displayThumbnails: {
			type: 'boolean',
			default: false,
		},
		displayContext: {
			type: 'boolean',
			default: true,
		},
		postsToShow: {
			type: 'number',
			default: 3,
		},
	},

	edit: ( { attributes, setAttributes } ) => {
		const {
			displayContext,
			displayDate,
			displayThumbnails,
			headline,
			postLayout,
			postsToShow,
		} = attributes;

		const layoutControls = [
			{
				icon: 'grid-view',
				title: __( 'Grid View' ),
				onClick: () => setAttributes( { postLayout: 'grid' } ),
				isActive: postLayout === 'grid',
			},
			{
				icon: 'list-view',
				title: __( 'List View' ),
				onClick: () => setAttributes( { postLayout: 'list' } ),
				isActive: postLayout === 'list',
			},
		];

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Related Posts Settings' ) }>
						<TextControl
							label={ __( 'Headline' ) }
							value={ headline }
							onChange={ value => setAttributes( { headline: value } ) }
						/>
						<ToggleControl
							label={ __( 'Display date' ) }
							checked={ displayDate }
							onChange={ value => setAttributes( { displayDate: value } ) }
						/>
						<ToggleControl
							label={ __( 'Display thumbnails' ) }
							checked={ displayThumbnails }
							onChange={ value => setAttributes( { displayThumbnails: value } ) }
						/>
						<ToggleControl
							label={ __( 'Display context (category or tag)' ) }
							checked={ displayContext }
							onChange={ value => setAttributes( { displayContext: value } ) }
						/>
						<RangeControl
							label={ __( 'Number of posts' ) }
							value={ postsToShow }
							onChange={ value => setAttributes( { postsToShow: value } ) }
							min={ 1 }
							max={ MAX_POSTS_TO_SHOW }
						/>
					</PanelBody>
				</InspectorControls>

				<BlockControls>
					<Toolbar controls={ layoutControls } />
				</BlockControls>

				<div>List of posts here</div>
			</Fragment>
		);
	},
	save: () => null,
} );
