import { TumblrPreviews } from '@automattic/social-previews';
import { PureComponent } from 'react';
import { decodeEntities } from 'calypso/lib/formatting';

export class TumblrSharePreview extends PureComponent {
	render() {
		const {
			externalProfilePicture,
			externalProfileURL,
			externalName,
			articleUrl,
			articleTitle,
			articleContent,
			imageUrl,
			message,
			media,
			hidePostPreview,
		} = this.props;

		const username = externalProfileURL?.match( /[^/]+$/ )?.[ 0 ];

		return (
			<TumblrPreviews
				url={ articleUrl }
				title={ decodeEntities( articleTitle ) }
				description={ decodeEntities( articleContent ) }
				customText={ decodeEntities( message ) }
				image={ imageUrl }
				user={ {
					displayName: externalName === 'Untitled' && username ? username : externalName,
					avatarUrl: externalProfilePicture,
				} }
				hidePostPreview={ hidePostPreview }
				media={ media }
			/>
		);
	}
}

export default TumblrSharePreview;
