/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

export class PathSharePreview extends PureComponent {

	static PropTypes = {
		articleUrl: PropTypes.string,
		externalProfilePicture: PropTypes.string,
		externalProfileUrl: PropTypes.string,
		externalName: PropTypes.string,
		imageUrl: PropTypes.string,
		message: PropTypes.string,
	};

	render() {
		const {
			articleUrl,
			externalProfilePicture,
			externalName,
			imageUrl,
			message
		} = this.props;
		return (
			<div className="path-share-preview">
				<div className="path-share-preview__content">
					<div className="path-share-preview__header">
						<img
							className="path-share-preview__profile-picture"
							src={ externalProfilePicture }
						/>
						<span className="path-share-preview__profile-name">
							{ externalName }
						</span>
					</div>
					{ imageUrl &&
						<div className="path-share-preview__image-wrapper">
							<img
								className="path-share-preview__image"
								src={ imageUrl }
							/>
						</div>
					}
					<div className="path-share-preview__body">
						<img
							className="path-share-preview__profile-picture"
							src={ externalProfilePicture }
						/>
						<div className="path-share-preview__message-part">
							<div className="path-share-preview__message">
								<span className="path-share-preview__profile-name">{ externalName }:</span> { message }
							</div>
							<div className="path-share-preview__summery">
								Summury of the post goes here.
							</div>
							<div className="path-share-preview__article-url-line">
								<a className="path-share-preview__article-url"
									href={ articleUrl }>
									{ articleUrl }
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default localize( PathSharePreview );

