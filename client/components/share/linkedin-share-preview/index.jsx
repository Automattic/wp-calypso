import { LinkedInPreview } from '@automattic/social-previews';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { decodeEntities } from 'calypso/lib/formatting';

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
			articleSummary,
			articleUrl,
			externalDisplay,
			externalProfilePicture,
			imageUrl,
			seoTitle,
		} = this.props;

		return (
			<div className="linkedin-share-preview">
				<LinkedInPreview
					image={ imageUrl }
					name={ externalDisplay }
					profileImage={ externalProfilePicture }
					title={ decodeEntities( seoTitle ) }
					text={ decodeEntities( articleSummary ) }
					url={ articleUrl }
				/>
			</div>
		);
	}
}

export default localize( LinkedinSharePreview );
