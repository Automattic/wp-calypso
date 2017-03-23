/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

export class TwitterSharePreview extends PureComponent {
	render() {
		// TODO: use real data
		const externalProfilePicture = 'https://3.bp.blogspot.com/-W__wiaHUjwI/Vt3Grd8df0I/AAAAAAAAA78/7xqUNj8ujtY/s1600/image02.png';
		const externalProfileUrl = 'https://example.com';
		const externalDisplay = 'Style and Gear';
		const externalName = 'styleandgear';
		const message = 'Do you have a trip coming up? Check out this winter travel gear roundup!';
		const articleUrl = 'https://styleandgear.com/2016/01/03/how-to-dress-like-a-proper-we-need-some-long-url';
		const imageUrl = 'https://www.w3schools.com/css/trolltunga.jpg';

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
