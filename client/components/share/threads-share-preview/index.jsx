import { ThreadsPreviews } from '@automattic/social-previews';
import { PureComponent } from 'react';
import { decodeEntities } from 'calypso/lib/formatting';

export class ThreadsSharePreview extends PureComponent {
	render() {
		const {
			articleUrl,
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
			<div className="threads-share-preview">
				<ThreadsPreviews
					posts={ [
						{
							description: decodeEntities( articleSummary ),
							title: decodeEntities( seoTitle ),
							image: imageUrl,
							url: articleUrl,
							name: externalName,
							profileImage: externalProfilePicture,
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

export default ThreadsSharePreview;
