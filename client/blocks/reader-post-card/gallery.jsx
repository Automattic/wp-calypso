import { DotPager } from '@automattic/components';
import ReaderExcerpt from 'calypso/blocks/reader-excerpt';
import AutoDirection from 'calypso/components/auto-direction';
import cssSafeUrl from 'calypso/lib/css-safe-url';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import { getImagesFromPostToDisplay } from 'calypso/state/reader/posts/normalization-rules';
import { GALLERY_MAX_IMAGES, READER_CONTENT_WIDTH } from 'calypso/state/reader/posts/sizes';

function PostGallery( { post, children } ) {
	const imagesToDisplay = getImagesFromPostToDisplay( post, GALLERY_MAX_IMAGES );

	function handleClick( event ) {
		event.preventDefault();
	}

	if ( ! imagesToDisplay || imagesToDisplay.length < 2 ) {
		return null;
	}

	const listItems = imagesToDisplay.map( ( image, index ) => {
		const imageUrl = resizeImageUrl( image.src, {
			w: READER_CONTENT_WIDTH,
		} );
		const safeCssUrl = cssSafeUrl( imageUrl );
		let imageStyle = { background: 'none' };
		if ( safeCssUrl ) {
			imageStyle = {
				backgroundImage: 'url(' + safeCssUrl + ')',
				backgroundSize: 'cover',
				backgroundPosition: '50% 50%',
				backgroundRepeat: 'no-repeat',
			};
		}
		return (
			<div
				className="reader-post-card__gallery-image"
				key={ `post-${ post.ID }-image-${ index }` }
				style={ imageStyle }
			/>
		);
	} );

	return (
		<div className="reader-post-card__post">
			<div className="reader-post-card__post-details">
				<AutoDirection>
					<h2 className="reader-post-card__title">
						<a className="reader-post-card__title-link" href={ post.URL }>
							{ post.title }
						</a>
					</h2>
				</AutoDirection>
				<ReaderExcerpt post={ post } />
			</div>
			<div onClick={ handleClick } role="presentation">
				<DotPager isClickEnabled>{ listItems }</DotPager>
			</div>
			<div className="reader-post-card__post-details">{ children }</div>
		</div>
	);
}

export default PostGallery;
