/**
 * External dependencies
 */
import React, { PureComponent, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

export class LinkedinSharePreview extends PureComponent {

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
			externalProfileUrl,
			externalName,
			imageUrl,
			message
		} = this.props;
		return (
			<div className="linkedin-share-preview">
				<div className="linkedin-share-preview__content">
					<div className="linkedin-share-preview__header">
						<div className="linkedin-share-preview__profile-picture-part">
							<img
								className="linkedin-share-preview__profile-picture"
								src={ externalProfilePicture }
							/>
						</div>
						<div className="linkedin-share-preview__profile-line-part">
							<div className="linkedin-share-preview__profile-line">
								<a className="linkedin-share-preview__profile-name" href={ externalProfileUrl }>
									{ externalName }
								</a>
							</div>
							<div className="linkedin-share-preview__meta-line">
								companyName
							</div>
						</div>
					</div>
					<div className="linkedin-share-preview__body">
						{ imageUrl &&
							<div className="linkedin-share-preview__image-wrapper">
								<a href={ articleUrl }>
									<img
										className="linkedin-share-preview__image"
										src={ imageUrl }
									/>
								</a>
							</div>
						}
						<a href={ articleUrl }>
							<div className="linkedin-share-preview__message">
								{ message }
							</div>
							<div className="linkedin-share-preview__site-url">
								siteUrl
							</div>
						</a>
					</div>
				</div>
			</div>
		);
	}
}

export default localize( LinkedinSharePreview );
