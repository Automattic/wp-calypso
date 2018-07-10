/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button, Spinner, ResponsiveWrapper, withFilters } from '@wordpress/components';
import { compose } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import './style.scss';
import PostFeaturedImageCheck from './check';
import MediaUpload from '../media-upload';

// Used when labels from post type were not yet loaded or when they are not present.
const DEFAULT_SET_FEATURE_IMAGE_LABEL = __( 'Set featured image' );
const DEFAULT_REMOVE_FEATURE_IMAGE_LABEL = __( 'Remove image' );

function PostFeaturedImage( { featuredImageId, onUpdateImage, onRemoveImage, media, postType } ) {
	const postLabel = get( postType, [ 'labels' ], {} );

	return (
		<PostFeaturedImageCheck>
			<div className="editor-post-featured-image">
				{ !! featuredImageId &&
					<MediaUpload
						title={ __( 'Set featured image' ) }
						onSelect={ onUpdateImage }
						type="image"
						modalClass="editor-post-featured-image__media-modal"
						render={ ( { open } ) => (
							<Button className="editor-post-featured-image__preview" onClick={ open }>
								{ media &&
									<ResponsiveWrapper
										naturalWidth={ media.media_details.width }
										naturalHeight={ media.media_details.height }
									>
										<img src={ media.source_url } alt={ __( 'Featured image' ) } />
									</ResponsiveWrapper>
								}
								{ ! media && <Spinner /> }
							</Button>
						) }
					/>
				}
				{ !! featuredImageId && media && ! media.isLoading &&
				<MediaUpload
					title={ postLabel.set_featured_image || DEFAULT_SET_FEATURE_IMAGE_LABEL }
					onSelect={ onUpdateImage }
					type="image"
					modalClass="editor-post-featured-image__media-modal"
					render={ ( { open } ) => (
						<Button onClick={ open } isDefault isLarge>
							{ __( 'Replace image' ) }
						</Button>
					) }
				/>
				}
				{ ! featuredImageId &&
					<div>
						<MediaUpload
							title={ postLabel.set_featured_image || DEFAULT_SET_FEATURE_IMAGE_LABEL }
							onSelect={ onUpdateImage }
							type="image"
							modalClass="editor-post-featured-image__media-modal"
							render={ ( { open } ) => (
								<Button className="editor-post-featured-image__toggle" onClick={ open }>
									{ __( 'Set featured image' ) }
								</Button>
							) }
						/>
					</div>
				}
				{ !! featuredImageId &&
					<Button onClick={ onRemoveImage } isLink isDestructive>
						{ postLabel.remove_featured_image || DEFAULT_REMOVE_FEATURE_IMAGE_LABEL }
					</Button>
				}
			</div>
		</PostFeaturedImageCheck>
	);
}

const applyWithSelect = withSelect( ( select ) => {
	const { getMedia, getPostType } = select( 'core' );
	const { getEditedPostAttribute } = select( 'core/editor' );
	const featuredImageId = getEditedPostAttribute( 'featured_media' );

	return {
		media: featuredImageId ? getMedia( featuredImageId ) : null,
		postType: getPostType( getEditedPostAttribute( 'type' ) ),
		featuredImageId,
	};
} );

const applyWithDispatch = withDispatch( ( dispatch ) => {
	const { editPost } = dispatch( 'core/editor' );
	return {
		onUpdateImage( image ) {
			editPost( { featured_media: image.id } );
		},
		onRemoveImage() {
			editPost( { featured_media: 0 } );
		},
	};
} );

export default compose(
	applyWithSelect,
	applyWithDispatch,
	withFilters( 'editor.PostFeaturedImage' ),
)( PostFeaturedImage );
