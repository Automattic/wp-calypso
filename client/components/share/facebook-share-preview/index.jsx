/**
 * External dependencies
 */
import React, { PureComponent } from 'react';

export class FacebookSharePreview extends PureComponent {
	render() {
		// TODO: use real data
		const externalProfilePicture = 'https://3.bp.blogspot.com/-W__wiaHUjwI/Vt3Grd8df0I/AAAAAAAAA78/7xqUNj8ujtY/s1600/image02.png';
		const externalProfileUrl = 'https://example.com';
		const externalName = 'Style and Gear';
		const message = 'Do you have a trip coming up? Check out this winter travel gear roundup!';
		const articleUrl = 'https://styleandgear.com/2016/01/03/how-to-dress-like-a-proper-we-need-some-long-url';
		const imageUrl = 'https://www.w3schools.com/css/trolltunga.jpg';

		return (
			<div className="facebook-share-preview">
				<div className="facebook-share-preview__content">
					<div className="facebook-share-preview__header">
						<div className="facebook-share-preview__profile-picture-part">
							<img
								className="facebook-share-preview__profile-picture"
								src={ externalProfilePicture }
							/>
						</div>
						<div className="facebook-share-preview__profile-line-part">
							<div className="facebook-share-preview__profile-line">
								<a href={ externalProfileUrl }>
									{ externalName }
								</a>
								published an article on
								<a href="https://wordpress.com">
									WordPress.
								</a>
							</div>
							<div className="facebook-share-preview__wp-line">
								WordPress
							</div>
						</div>
					</div>
					<div className="facebook-share-preview__body">
						<div className="facebook-share-preview__message">
							{ message }
						</div>
						<div className="facebook-share-preview__article-url">
							{ articleUrl }
						</div>
						{ imageUrl &&
							<div className="facebook-share-preview__image-wrapper">
								<img
									className="facebook-share-preview__image"
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

export default FacebookSharePreview;
