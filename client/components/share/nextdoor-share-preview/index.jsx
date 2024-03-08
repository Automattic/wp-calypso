import { NextdoorPreviews } from '@automattic/social-previews';
import { PureComponent } from 'react';
import { decodeEntities } from 'calypso/lib/formatting';

export class NextdoorSharePreview extends PureComponent {
	render() {
		const {
			siteName,
			externalProfilePicture,
			externalDisplay,
			articleUrl,
			articleTitle,
			imageUrl,
			message,
			hidePostPreview,
			media,
		} = this.props;

		let description = decodeEntities( message || articleTitle );
		// Add the URL to the description if there is media
		description += media.length ? ` ${ articleUrl }` : '';

		return (
			<NextdoorPreviews
				siteName={ siteName }
				url={ articleUrl }
				title={ decodeEntities( articleTitle ) }
				description={ description }
				image={ imageUrl }
				name={ externalDisplay }
				profileImage={ externalProfilePicture }
				hidePostPreview={ hidePostPreview }
				media={ media }
			/>
		);
	}
}

export default NextdoorSharePreview;
