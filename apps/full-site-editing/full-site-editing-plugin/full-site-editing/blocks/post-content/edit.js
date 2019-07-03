/* eslint-disable wpcalypso/jsx-classname-namespace */
/* global fullSiteEditing */

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
import { BlockControls, InnerBlocks, PostTitle } from '@wordpress/editor';
import { Component, Fragment, RawHTML } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import PostAutocomplete from '../../components/post-autocomplete';

class PostContentEdit extends Component {
	toggleEditing() {
		const { isEditing, setState } = this.props;
		setState( { isEditing: ! isEditing } );
	}

	onSelectPost( { id, type } ) {
		this.props.setState( {
			isEditing: false,
			selectedPostId: id,
			selectedPostType: type,
		} );
	}

	render() {
		const { attributes, isEditing, selectedPost } = this.props;
		const { align } = attributes;

		const isTemplatePostType = 'wp_template' === fullSiteEditing.editorPostType;
		const showToggleButton = isTemplatePostType && ( ! isEditing || !! selectedPost );
		const showPlaceholder = isTemplatePostType && ( isEditing || ! selectedPost );
		const showPreview = isTemplatePostType && ! isEditing && !! selectedPost;
		const showInnerBlocks = ! isTemplatePostType;

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
								onClick={ this.toggleEditing }
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
					<PostTitle />
					{ showInnerBlocks && <InnerBlocks templateLock={ false } /> }
					{ showPlaceholder && (
						<Placeholder
							icon="layout"
							label={ __( 'Content Slot' ) }
							instructions={ __( 'Placeholder for a post or a page.' ) }
						>
							<div className="post-content-block__selector">
								<div>{ __( 'Select something to preview:' ) }</div>
								<PostAutocomplete
									initialValue={ get( selectedPost, [ 'title', 'rendered' ] ) }
									onSelectPost={ this.onSelectPost }
									postType={ [ 'page', 'post' ] }
								/>
								{ !! selectedPost && (
									<a href={ `?post=${ selectedPost.id }&action=edit` }>
										{ sprintf(
											__( 'Edit "%s"' ),
											get( selectedPost, [ 'title', 'rendered' ], '' )
										) }
									</a>
								) }
							</div>
						</Placeholder>
					) }
					{ showPreview && (
						<RawHTML className="post-content-block__preview">
							{ get( selectedPost, [ 'content', 'rendered' ] ) }
						</RawHTML>
					) }
				</div>
			</Fragment>
		);
	}
}

export default compose( [
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
	} ),
] )( PostContentEdit );
