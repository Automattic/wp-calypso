/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

export class TwitterSharePreview extends PureComponent {
	render() {
		const {
			externalProfilePicture,
			externalProfileUrl,
			externalDisplay,
			externalName,
			message,
			articleUrl,
			imageUrl
		} = this.props;

		return (
			<div className="twitter-share-preview">
				<div className="twitter-share-preview__content">
					<div className="twitter-share-preview__profile-picture-part">
						<img
							className="twitter-share-preview__profile-picture"
							src={ externalProfilePicture }
						/>
					</div>
					<div className="twitter-share-preview__content-part">
						<div className="twitter-share-preview__profile-line">
							<a
								className="twitter-share-preview__profile-name"
								href={ externalProfileUrl }
							>
								{ externalDisplay }
							</a>
							<a
								className="twitter-share-preview__profile-handle"
								href={ externalProfileUrl }
							>
								@{ externalName }
							</a>
						</div>
						<div className="twitter-share-preview__message">
							{ message }
						</div>
						<div className="twitter-share-preview__article-url-line">
							<a className="twitter-share-preview__article-url"
								href={ articleUrl }>
								{ articleUrl }
							</a>
						</div>
						{ imageUrl &&
							<div className="twitter-share-preview__image-wrapper">
								<img
									className="twitter-share-preview__image"
									src={ imageUrl }
								/>
							</div>
						}
					</div>
				</div>
			</div>
		);
	}
}

export default TwitterSharePreview;
