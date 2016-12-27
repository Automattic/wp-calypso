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
	const posts = [
		{
			image: '/calypso/images/related-posts/cat-blog.png',
			title: translate( 'Big iPhone/iPad Update Now Available', {
				textOnly: true,
				context: 'Demo content for related posts'
			} ),
			topic: translate( 'In "Mobile"', {
				context: 'topic post is located in'
			} )
		},
		{
			image: '/calypso/images/related-posts/devices.jpg',
			title: translate( 'The WordPress for Android App Gets a Big Facelift', {
				textOnly: true,
				context: 'Demo content for related posts'
			} ),
			topic: translate( 'In "Mobile"', {
				context: 'topic post is located in'
			} )
		},
		{
			image: '/calypso/images/related-posts/mobile-wedding.jpg',
			title: translate( 'Upgrade Focus: VideoPress For Weddings', {
				textOnly: true,
				context: 'Demo content for related posts'
			} ),
			topic: translate( 'In "Upgrade"', {
				context: 'topic post is located in'
			} )
		}
	];

	return (
		<div id="settings-reading-relatedposts-preview" className={ enabled ? null : 'disabled-block' }>
			<FormLabel>{ translate( 'Preview:' ) }</FormLabel>

			<div id="jp-relatedposts" className="jp-relatedposts">
				{
					showHeadline &&
					<h3 className="jp-relatedposts-headline">{ translate( 'Related' ) }</h3>
				}

				<div className="jp-relatedposts-items">
					{
						posts.map( ( post, index ) => {
							return (
								<div className="jp-relatedposts-post" key={ index }>
									{ showThumbnails &&
										<a className="jp-relatedposts-post-a">
											<img className="jp-relatedposts-post-img" src={ post.image } alt={ post.title } />
										</a>
									}
									<h4 className="jp-relatedposts-post-title">
										<a className="jp-relatedposts-post-a">
											{ post.title }
										</a>
									</h4>
									<p className="jp-relatedposts-post-context">{ post.topic }</p>
								</div>
							);
						} )
					}
				</div>
			</div>
		</div>
	);
};

export default localize( RelatedContentPreview );
