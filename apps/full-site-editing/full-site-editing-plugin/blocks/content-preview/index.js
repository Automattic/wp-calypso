/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { IconButton, Placeholder, Toolbar } from '@wordpress/components';
import { compose, withState } from '@wordpress/compose';
import { BlockControls } from '@wordpress/editor';
import { Fragment, RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import PostAutocomplete from '../../components/post-autocomplete';
import './style.scss';

const edit = compose(
	withState( {
		isEditing: false,
	} )
)( ( { attributes, isEditing, setAttributes, setState } ) => {
	const { align, selectedPost } = attributes;

	const toggleEditing = () => setState( { isEditing: ! isEditing } );

	const onSelectPost = post => {
		setState( { isEditing: false } );
		setAttributes( { selectedPost: post } );
	};

	const showToggleButton = ! isEditing || !! selectedPost;
	const showPlaceholder = isEditing || ! selectedPost;
	const showPreview = ! isEditing && !! selectedPost;

	return (
		<Fragment>
			{ showToggleButton && (
				<BlockControls>
					<Toolbar>
						<IconButton
							className={ classNames( 'components-icon-button components-toolbar__control', {
								'is-active': isEditing,
							} ) }
							label={ __( 'Change Preview' ) }
							onClick={ toggleEditing }
							icon="edit"
						/>
					</Toolbar>
				</BlockControls>
			) }
			<div
				className={ classNames( 'a8c-content-preview-block', {
					[ `align${ align }` ]: align,
				} ) }
			>
				{ showPlaceholder && (
					<Placeholder
						icon="layout"
						label={ __( 'Content Preview' ) }
						instructions={ __( 'Select something to preview' ) }
					>
						<div className="a8c-content-preview-block__selector">
							<PostAutocomplete onSelectPost={ onSelectPost } />
							{ !! selectedPost && (
								<a href={ `?post=${ selectedPost.id }&action=edit` }>{ __( 'Edit' ) }</a>
							) }
						</div>
					</Placeholder>
				) }
				{ showPreview && (
					<RawHTML className="a8c-content-preview-block__preview">
						{ get( selectedPost, 'content.rendered' ) }
					</RawHTML>
				) }
			</div>
		</Fragment>
	);
} );

registerBlockType( 'a8c/content-preview', {
	title: __( 'Content Preview' ),
	description: __( 'Previews the content of a post or a page into the editor.' ),
	icon: 'layout',
	category: 'layout',
	attributes: {
		selectedPost: { type: 'object' },
	},
	supports: {
		align: [ 'wide', 'full' ],
		anchor: true,
		html: false,
		reusable: false,
	},
	edit,
	save: () => null,
} );
