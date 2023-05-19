import { MastodonPreviews } from '@automattic/social-previews';
import { PureComponent } from 'react';
import { decodeEntities } from 'calypso/lib/formatting';

export class MastodonSharePreview extends PureComponent {
	render() {
		const {
			externalProfilePicture,
			externalName,
			externalDisplay,
			articleUrl,
			articleTitle,
			articleContent,
			imageUrl,
			message,
		} = this.props;

		const userName = externalDisplay?.replace( '@mastodon.social', '' );

		return (
			<MastodonPreviews
				url={ articleUrl }
				title={ decodeEntities( articleTitle ) }
				description={ decodeEntities( articleContent ) }
				customText={ decodeEntities( message ) }
				image={ imageUrl }
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
