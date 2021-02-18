/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { FacebookPreview } from '@automattic/social-previews';

/**
 * Style dependencies
 */
import './style.scss';

export class FacebookSharePreview extends PureComponent {
	static propTypes = {
		articleContent: PropTypes.string,
		articleSummary: PropTypes.string,
		articleUrl: PropTypes.string,
		externalName: PropTypes.string,
		externalProfilePicture: PropTypes.string,
		externalProfileUrl: PropTypes.string,
		imageUrl: PropTypes.string,
		message: PropTypes.string,
		seoTitle: PropTypes.string,
		siteIcon: PropTypes.string,
	};

	state = {
		isProfileImageBroken: false,
	};

	setBrokenProfileImage = () => this.setState( { isProfileImageBroken: true } );

	render() {
		const {
			articleContent,
			articleSummary,
			articleUrl,
			externalDisplay,
			externalProfilePicture,
			externalProfileUrl,
			imageUrl,
			message,
			seoTitle,
			siteIcon,
			translate,
		} = this.props;
		const { isProfileImageBroken } = this.state;
		return (
			<div className="facebook-share-preview">
				<div className="facebook-share-preview__content">
					<div className="facebook-share-preview__header">
						<div className="facebook-share-preview__profile-picture-part">
							{ ! isProfileImageBroken && (
								<img
									className="facebook-share-preview__profile-picture"
									src={ externalProfilePicture }
									onError={ this.setBrokenProfileImage }
									alt={ externalDisplay }
								/>
							) }
						</div>

						<div className="facebook-share-preview__profile-line-part">
							<div className="facebook-share-preview__profile-line">
								<a className="facebook-share-preview__profile-name" href={ externalProfileUrl }>
									{ externalDisplay }
								</a>
								<span>
									{ translate( 'published an article on {{a}}WordPress{{/a}}.', {
										components: {
											a: <span className="facebook-share-preview__application-link" />,
										},
									} ) }
								</span>
							</div>
							<div className="facebook-share-preview__meta-line">
								{ translate( 'Just now', {
									comment: 'Facebook relative time for just published posts.',
								} ) }
								<span> &middot; </span>
								<a href="https://wordpress.com">{ translate( 'WordPress' ) }</a>
							</div>
						</div>
					</div>

					<div className="facebook-share-preview__body">
						<div className="facebook-share-preview__message">
							{ message ? message : articleSummary }
						</div>
						<div className="facebook-share-preview__article-url-line">
							<a className="facebook-share-preview__article-url" href={ articleUrl }>
								{ articleUrl }
							</a>
						</div>

						{ imageUrl !== null && (
							<div className="facebook-share-preview__image-wrapper">
								<img
									alt="Facebook Preview Thumbnail"
									className="facebook-share-preview__image"
									src={ imageUrl }
								/>
							</div>
						) }

						{ imageUrl === null && (
							<div className="facebook-share-preview__card-wrapper">
								<FacebookPreview
									title={ seoTitle }
									type="website"
									description={ articleContent }
									image={ siteIcon }
									author="WORDPRESS"
								/>
							</div>
						) }
					</div>
				</div>
			</div>
		);
	}
}

export default localize( FacebookSharePreview );
