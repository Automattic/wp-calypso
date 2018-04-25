/** @format */
/* eslint-disable jsx-a11y/alt-text, jsx-a11y/anchor-is-valid */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';
import { isNull } from 'lodash';

export class FacebookSharePreview extends PureComponent {
	static propTypes = {
		articleContent: PropTypes.string,
		articleSummary: PropTypes.string,
		articleTitle: PropTypes.string,
		articleUrl: PropTypes.string,
		externalName: PropTypes.string,
		externalProfilePicture: PropTypes.string,
		externalProfileUrl: PropTypes.string,
		imageUrl: PropTypes.string,
		message: PropTypes.string,
	};

	state = {
		isProfileImageBroken: false,
	};

	setBrokenProfileImage = () => this.setState( { isProfileImageBroken: true } );

	render() {
		const {
			articleSummary,
			articleUrl,
			externalProfilePicture,
			externalProfileUrl,
			externalDisplay,
			imageUrl,
			message,
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
											a: <a href="#" />,
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

					{ ! isNull( imageUrl ) && (
						<div className="facebook-share-preview__body">
							<div className="facebook-share-preview__message">
								{ message ? message : articleSummary }
							</div>
							<div className="facebook-share-preview__article-url-line">
								<a className="facebook-share-preview__article-url" href={ articleUrl }>
									{ articleUrl }
								</a>
							</div>
							<div className="facebook-share-preview__image-wrapper">
								<img className="facebook-share-preview__image" src={ imageUrl } />
							</div>
						</div>
					) }
				</div>
			</div>
		);
	}
}

export default localize( FacebookSharePreview );
