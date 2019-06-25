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
	componentDidMount() {
		this.toggleEditorPostTitleVisibility();
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.isFullSitePage !== prevProps.isFullSitePage ) {
			this.toggleEditorPostTitleVisibility();
		}
	}

	componentWillUnmount() {
		this.toggleEditorPostTitleVisibility( true );
	}

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

	/**
	 * Hides the default post title of the editor when editing a full site page and shows new post title rendered by the
	 * post content block in order to have it just before the content of the post.
	 *
	 * @param {boolean} forceDefaultPostTitle Whether the default post title should be always displayed.
	 */
	toggleEditorPostTitleVisibility( forceDefaultPostTitle = false ) {
		const showPostTitleBeforeContent = this.props.isFullSitePage && ! forceDefaultPostTitle;
		document
			.querySelector( '#editor' )
			.classList.toggle( 'show-post-title-before-content', showPostTitleBeforeContent );
	}

	render() {
		const { attributes, isEditing, isFullSitePage, selectedPost } = this.props;
		const { align } = attributes;

		const isTemplatePostType = 'wp_template' === fullSiteEditing.editorPostType;
		const showToggleButton = isTemplatePostType && ( ! isEditing || !! selectedPost );
		const showPlaceholder = isTemplatePostType && ( isEditing || ! selectedPost );
		const showPreview = isTemplatePostType && ! isEditing && !! selectedPost;
		const showInnerBlocks = ! isTemplatePostType;
		const showPostTitle = ! isTemplatePostType && isFullSitePage;

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
					{ showPostTitle && <PostTitle /> }
					{ showInnerBlocks && <InnerBlocks /> }
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
		const isFullSitePage = select( 'a8c/full-site-editing' ).isFullSitePage();
		return {
			selectedPost: getEntityRecord( 'postType', selectedPostType, selectedPostId ),
			isFullSitePage,
		};
	} ),
] )( PostContentEdit );
