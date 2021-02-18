/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

export class LinkedinSharePreview extends PureComponent {
	static propTypes = {
		articleUrl: PropTypes.string,
		externalProfilePicture: PropTypes.string,
		externalProfileUrl: PropTypes.string,
		imageUrl: PropTypes.string,
		message: PropTypes.string,
		name: PropTypes.string,
		siteDomain: PropTypes.string,
	};

	render() {
		const {
			articleUrl,
			externalDisplay,
			externalProfilePicture,
			externalProfileUrl,
			imageUrl,
			message,
			siteDomain,
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
									{ externalDisplay }
								</a>
							</div>
						</div>
					</div>
					<div className="linkedin-share-preview__body">
						{ imageUrl && (
							<div className="linkedin-share-preview__image-wrapper">
								<a href={ articleUrl }>
									<img className="linkedin-share-preview__image" src={ imageUrl } />
								</a>
							</div>
						) }
						<div className="linkedin-share-preview__message-part">
							<a className="linkedin-share-preview__message-link" href={ articleUrl }>
								<div className="linkedin-share-preview__message">{ message }</div>
								<div className="linkedin-share-preview__site-url">{ siteDomain }</div>
							</a>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default localize( LinkedinSharePreview );
