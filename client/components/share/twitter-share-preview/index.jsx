import { TwitterPreviews } from '@automattic/social-previews';
import { PureComponent } from 'react';
import { decodeEntities } from 'calypso/lib/formatting';

import './style.scss';

export class TwitterSharePreview extends PureComponent {
	render() {
		const {
			articleUrl,
			externalDisplay,
			externalName,
			externalProfilePicture,
			message,
			imageUrl,
			seoTitle,
			articleSummary,
		} = this.props;

		return (
			<div className="twitter-share-preview">
				<TwitterPreviews
					tweets={ [
						{
							cardType: 'summary_large_image',
							description: decodeEntities( articleSummary ),
							title: decodeEntities( seoTitle ),
							image: imageUrl,
							url: articleUrl,
							date: Date.now(),
							name: externalName,
							profileImage: externalProfilePicture,
							screenName: externalDisplay,
							text: message,
						},
					] }
				/>
			</div>
		);
	}
}

export default TwitterSharePreview;
