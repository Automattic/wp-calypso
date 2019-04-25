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
import { withState } from '@wordpress/compose';
import { BlockControls } from '@wordpress/editor';
import { Fragment, RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import PostAutocomplete from '../../components/post-autocomplete';
import fetchPost from '../../lib/fetch-post';
import './style.scss';

const setSelectedPost = async ( attributes, setState ) => {
	const { selectedPostId, selectedPostType } = attributes;
	const selectedPost = await fetchPost( selectedPostId, selectedPostType );
	setState( {
		selectedPost,
	} );
};

const edit = withState( {
	isEditing: false,
	selectedPost: null,
} )( ( { attributes, isEditing, selectedPost, setAttributes, setState } ) => {
	const { align, selectedPostId } = attributes;

	if ( !! selectedPostId && ! selectedPost ) {
		setSelectedPost( attributes, setState );
	}

	const toggleEditing = () => setState( { isEditing: ! isEditing } );

	const onSelectPost = post => {
		setState( { isEditing: false, selectedPost: post } );
		setAttributes( {
			selectedPostId: get( post, 'id' ),
			selectedPostType: get( post, 'type' ),
		} );
	};

	const showToggleButton = ! isEditing || !! selectedPostId;
	const showPlaceholder = isEditing || ! selectedPostId;
	const showPreview = ! isEditing && !! selectedPostId;

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
							<PostAutocomplete
								selectedPostTitle={ get( selectedPost, 'title.rendered' ) }
								onSelectPost={ onSelectPost }
							/>
							{ !! selectedPostId && (
								<a href={ `?post=${ selectedPostId }&action=edit` }>{ __( 'Edit' ) }</a>
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
		selectedPostId: { type: 'number' },
		selectedPostType: { type: 'string' },
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
