import { TwitterPreviews } from '@automattic/social-previews';
import { PureComponent } from 'react';
import { decodeEntities } from 'calypso/lib/formatting';

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
			hidePostPreview,
			media,
		} = this.props;

		return (
			<div className="twitter-share-preview">
				<TwitterPreviews
					tweets={ [
						{
							cardType: imageUrl ? 'summary_large_image' : null,
							description: decodeEntities( articleSummary ),
							title: decodeEntities( seoTitle ),
							image: imageUrl,
							url: articleUrl,
							date: Date.now(),
							name: externalName,
							profileImage: externalProfilePicture,
							screenName: externalDisplay,
							text: message,
							media,
						},
					] }
					hidePostPreview={ hidePostPreview }
				/>
			</div>
		);
	}
}

export default TwitterSharePreview;
