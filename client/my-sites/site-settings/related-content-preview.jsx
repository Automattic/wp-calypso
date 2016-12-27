/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';

const RelatedContentPreview = ( { enabled, showHeadline, showThumbnails, translate } ) => {
	return (
		<div id="settings-reading-relatedposts-preview" className={ enabled ? null : 'disabled-block' }>
			<FormLabel>{ translate( 'Preview:' ) }</FormLabel>
			<div id="jp-relatedposts" className="jp-relatedposts">
				{ showHeadline ?
				<h3 className="jp-relatedposts-headline">{ translate( 'Related' ) }</h3>
				: null }
				<div className="jp-relatedposts-items jp-relatedposts-items-visual">
					<div className="jp-relatedposts-post jp-relatedposts-post0 jp-relatedposts-post-thumbs" data-post-format="image">
						{ showThumbnails ?
						<a className="jp-relatedposts-post-a" href="#jetpack_relatedposts" rel="nofollow" data-origin="0" data-position="0">
							<img className="jp-relatedposts-post-img" src="/calypso/images/related-posts/cat-blog.png" width="350" alt={ translate( 'Big iPhone/iPad Update Now Available', { textOnly: true, context: 'Demo content for related posts' } ) } scale="0" />
						</a>
						: null }
						<h4 className="jp-relatedposts-post-title">
							<a className="jp-relatedposts-post-a" href="#jetpack_relatedposts" rel="nofollow" data-origin="0" data-position="0">
								{ translate( 'Big iPhone/iPad Update Now Available' ) }
							</a>
						</h4>
						<p className="jp-relatedposts-post-context">{ translate( 'In "Mobile"', { context: 'topic post is located in' } ) }</p>
					</div>
					<div className="jp-relatedposts-post jp-relatedposts-post1 jp-relatedposts-post-thumbs" data-post-id="0" data-post-format="image">
						{ showThumbnails ?
						<a className="jp-relatedposts-post-a" href="#jetpack_relatedposts" rel="nofollow" data-origin="0" data-position="0">
							<img className="jp-relatedposts-post-img" src="/calypso/images/related-posts/devices.jpg" width="350" alt={ translate( 'The WordPress for Android App Gets a Big Facelift', { textOnly: true, context: 'Demo content for related posts' } ) } scale="0" />
						</a>
						: null }
						<h4 className="jp-relatedposts-post-title">
							<a className="jp-relatedposts-post-a" href="#jetpack_relatedposts" rel="nofollow" data-origin="0" data-position="0">
								{ translate( 'The WordPress for Android App Gets a Big Facelift' ) }
							</a>
						</h4>
						<p className="jp-relatedposts-post-context">{ translate( 'In "Mobile"', { context: 'topic post is located in' } ) }</p>
					</div>
					<div className="jp-relatedposts-post jp-relatedposts-post2 jp-relatedposts-post-thumbs" data-post-id="0" data-post-format="image">
						{ showThumbnails ?
						<a className="jp-relatedposts-post-a" href="#jetpack_relatedposts" rel="nofollow" data-origin="0" data-position="0">
							<img className="jp-relatedposts-post-img" src="/calypso/images/related-posts/mobile-wedding.jpg" width="350" alt={ translate( 'Upgrade Focus: VideoPress For Weddings', { textOnly: true, context: 'Demo content for related posts' } ) } scale="0" />
						</a>
						: null }
						<h4 className="jp-relatedposts-post-title">
							<a className="jp-relatedposts-post-a" href="#jetpack_relatedposts" rel="nofollow" data-origin="0" data-position="0">
								{ translate( 'Upgrade Focus: VideoPress For Weddings' ) }
							</a>
						</h4>
						<p className="jp-relatedposts-post-context">{ translate( 'In "Upgrade"', { context: 'topic post is located in' } ) }</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default localize( RelatedContentPreview );
