/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { truncateArticleContent } from '../helpers';

export class GooglePlusSharePreview extends PureComponent {

	static propTypes = {
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
			articleTitle,
			articleContent,
			externalProfilePicture,
			externalProfileUrl,
			externalName,
			imageUrl,
			message
		} = this.props;

		const summary = truncateArticleContent( 255, articleContent );

		return (
			<div className="google-plus-share-preview">
				<div className="google-plus-share-preview__content">
					<div className="google-plus-share-preview__header">
						<div className="google-plus-share-preview__profile-picture-part">
							<img
								className="google-plus-share-preview__profile-picture"
								src={ externalProfilePicture }
							/>
						</div>
						<div className="google-plus-share-preview__profile-line-part">
							<div className="google-plus-share-preview__profile-line">
								<a className="google-plus-share-preview__profile-name" href={ externalProfileUrl }>
									{ externalName }
								</a>
							</div>
						</div>
					</div>
					<div className="google-plus-share-preview__body">
						<div className="google-plus-share-preview__message">
							{ message }
						</div>
						<div className="google-plus-share-preview__article-summary">
						{ summary }
						</div>
						<div className="google-plus-share-preview__article-title">
							<a className="google-plus-share-preview__article-url" href={ articleUrl }>
							{ articleTitle }
							</a>
						</div>
						{ imageUrl &&
							<div className="google-plus-share-preview__image-wrapper">
								<a href={ articleUrl }>
								<img
									className="google-plus-share-preview__image"
									src={ imageUrl }
								/>
								</a>
							</div>
						}
					</div>
				</div>
			</div>
		);
	}
}

export default localize( GooglePlusSharePreview );
