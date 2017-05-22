/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

/* Internal dependecies */
import { localize } from 'i18n-calypso';

export class TumblrSharePreview extends PureComponent {
	render() {
		const {
			externalProfilePicture,
			externalProfileUrl,
			externalDisplay,
			externalName,
			message,
			articleUrl,
			imageUrl,
			postTitle,
			translate,
		} = this.props;

		return (
			<div className="tumblr-share-preview">
				<div className="tumblr-share-preview__content">
					<div className="tumblr-share-preview__profile-picture-part">
						<img
							className="tumblr-share-preview__profile-picture"
							src={ externalProfilePicture }
						/>
					</div>
					<div className="tumblr-share-preview__content-part">
						<div className="tumblr-share-preview__profile-line">
							<a
								className="tumblr-share-preview__profile-name"
								href={ externalProfileUrl }
							>
								{ externalDisplay }
							</a>
							<a
								className="tumblr-share-preview__profile-handle"
								href={ externalProfileUrl }
							>
								{ externalName }
							</a>
						</div>
						<div className="tumblr-share-preview__post-title">
							<h1> { postTitle } </h1>
						</div>
						{ imageUrl &&
							<div className="tumblr-share-preview__image-wrapper">
								<img
									className="tumblr-share-preview__image"
									src={ imageUrl }
								/>
							</div>
						}
						<div className="tumblr-share-preview__message">
							<blockquote>
								{ message }
							</blockquote>
						</div>
						<div className="tumblr-share-preview__article-url-line">
							<a className="tumblr-share-preview__article-url"
								href={ articleUrl }>
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

