/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import classNames from 'classnames';
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { IconButton, Placeholder, Toolbar } from '@wordpress/components';
import { compose, withState } from '@wordpress/compose';
import { withSelect } from '@wordpress/data';
import { BlockControls } from '@wordpress/editor';
import { Fragment, RawHTML } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import PostAutocomplete from '../../components/post-autocomplete';

const PostContentEdit = compose(
	withState( {
		isEditing: false,
		selectedPostId: undefined,
		selectedPostType: undefined,
	} ),
	withSelect( ( select, { selectedPostId, selectedPostType } ) => {
		const { getEntityRecord } = select( 'core' );
		return {
			selectedPost: getEntityRecord( 'postType', selectedPostType, selectedPostId ),
		};
	} )
)( ( { attributes, isEditing, selectedPost, setState } ) => {
	const { align } = attributes;

	const toggleEditing = () => setState( { isEditing: ! isEditing } );

	const onSelectPost = ( { id, type } ) => {
		setState( {
			isEditing: false,
			selectedPostId: id,
			selectedPostType: type,
		} );
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
				className={ classNames( 'post-content-block', {
					[ `align${ align }` ]: align,
				} ) }
			>
				{ showPlaceholder && (
					<Placeholder
						icon="layout"
						label={ __( 'Content Slot' ) }
						instructions={ __( 'Placeholder for a post or a page.' ) }
					>
						<div className="post-content-block__selector">
							<div>{ __( 'Select something to preview:' ) }</div>
							<PostAutocomplete
								defaultValue={ get( selectedPost, 'title.rendered' ) }
								onSelectPost={ onSelectPost }
								postType={ [ 'page', 'post' ] }
							/>
							{ !! selectedPost && (
								<a href={ `?post=${ selectedPost.id }&action=edit` }>
									{ sprintf( __( 'Edit "%s"' ), get( selectedPost, 'title.rendered', '' ) ) }
								</a>
							) }
						</div>
					</Placeholder>
				) }
				{ showPreview && (
					<RawHTML className="post-content-block__preview">
						{ get( selectedPost, 'content.rendered' ) }
					</RawHTML>
				) }
			</div>
		</Fragment>
	);
} );

export default PostContentEdit;
