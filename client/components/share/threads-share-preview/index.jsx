import { ThreadsPreviews } from '@automattic/social-previews';
import { PureComponent } from 'react';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';

export class ThreadsSharePreview extends PureComponent {
	render() {
		const {
			articleUrl,
			externalName,
			externalProfilePicture,
			message,
			imageUrl,
			seoTitle,
			articleContent,
			hidePostPreview,
			media,
		} = this.props;

		let caption = seoTitle;

		if ( message ) {
			caption = message;
		} else if ( seoTitle && articleContent ) {
			caption = `${ seoTitle }\n\n${ articleContent }`;
		}

		const captionLength =
			// 500 characters
			500 -
			// Number of characters in the article URL
			articleUrl.length -
			// 2 characters for line break
			2;

		caption = stripHTML( decodeEntities( caption ) ).slice( 0, captionLength );

		caption += `\n\n${ articleUrl }`;

		return (
			<div className="threads-share-preview">
				<ThreadsPreviews
					posts={ [
						{
							title: decodeEntities( seoTitle ),
							image: imageUrl,
							url: articleUrl,
							name: externalName,
							profileImage: externalProfilePicture,
							caption,
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
