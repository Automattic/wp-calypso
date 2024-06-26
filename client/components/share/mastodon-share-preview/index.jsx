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
			media,
			message,
			hidePostPreview,
		} = this.props;

		return (
			<MastodonPreviews
				siteName={ siteName }
				url={ articleUrl }
				title={ decodeEntities( articleTitle ) }
				description={ decodeEntities( articleContent ) }
				customText={ decodeEntities( message ) }
				image={ imageUrl }
				media={ media }
				user={ {
					displayName: externalName,
					avatarUrl: externalProfilePicture,
					address: externalDisplay,
				} }
				hidePostPreview={ hidePostPreview }
			/>
		);
	}
}

export default MastodonSharePreview;
