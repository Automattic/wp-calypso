/**
 * External dependencies
 */

import React, { PureComponent } from 'react';

/* Internal dependencies */
import { localize } from 'i18n-calypso';
import { truncateArticleContent } from '../helpers';

/**
 * Style dependencies
 */
import './style.scss';

export class TumblrSharePreview extends PureComponent {
	render() {
		const {
			externalProfilePicture,
			externalProfileUrl,
			externalName,
			message,
			articleUrl,
			articleTitle,
			articleContent,
			imageUrl,
			translate,
		} = this.props;

		const summary = truncateArticleContent( 396, articleContent );
		return (
			<div className="tumblr-share-preview">
				<div className="tumblr-share-preview__content">
					<div className="tumblr-share-preview__profile-picture-part">
						<img className="tumblr-share-preview__profile-picture" src={ externalProfilePicture } />
					</div>
					<div className="tumblr-share-preview__content-part">
						<div className="tumblr-share-preview__profile-line">
							<a className="tumblr-share-preview__profile-name" href={ externalProfileUrl }>
								{ externalName }
							</a>
							<span className="tumblr-share-preview__profile-wp">{ translate( 'WordPress' ) }</span>
						</div>
						<div className="tumblr-share-preview__post-title-part">
							<div className="tumblr-share-preview__post-title">{ articleTitle }</div>
						</div>
						<div className="tumblr-share-preview__message">
							<a className="tumblr-share-preview__message-link" href={ articleUrl }>
								{ message }
							</a>
						</div>
						{ imageUrl && (
							<div className="tumblr-share-preview__image-wrapper">
								<img className="tumblr-share-preview__image" src={ imageUrl } />
							</div>
						) }
						<div className="tumblr-share-preview__summery-part">
							<blockquote className="tumblr-share-preview__summery">{ summary }</blockquote>
						</div>
						<div className="tumblr-share-preview__article-link-line">
							<a className="tumblr-share-preview__article-link" href={ articleUrl }>
								{ translate( 'View On WordPress' ) }
							</a>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default localize( TumblrSharePreview );
