import { MastodonPreviews } from '@automattic/social-previews';
import { PureComponent } from 'react';
import { decodeEntities } from 'calypso/lib/formatting';

export class MastodonSharePreview extends PureComponent {
	render() {
		const {
			siteName,
			externalProfilePicture,
			externalName,
			externalDisplay,
			articleUrl,
			articleTitle,
			articleContent,
			imageUrl,
			customImage,
			isSocialPost,
			message,
		} = this.props;

		const userName = externalDisplay?.replace( '@mastodon.social', '' );

		return (
			<MastodonPreviews
				siteName={ siteName }
				url={ articleUrl }
				title={ decodeEntities( articleTitle ) }
				description={ decodeEntities( articleContent ) }
				customText={ decodeEntities( message ) }
				image={ imageUrl }
				customImage={ customImage }
				isSocialPost={ isSocialPost }
				user={ {
					displayName: externalName,
					userName,
					avatarUrl: externalProfilePicture,
				} }
			/>
		);
	}
}

export default MastodonSharePreview;
