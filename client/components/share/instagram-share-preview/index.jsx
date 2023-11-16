import { InstagramPreviews } from '@automattic/social-previews';
import { useTranslate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { decodeEntities } from 'calypso/lib/formatting';

export function InstagramSharePreview( {
	externalProfilePicture,
	externalName,
	articleTitle,
	imageUrl,
	message,
	media,
} ) {
	const translate = useTranslate();

	if ( ! imageUrl && ! media?.length ) {
		return (
			<Notice
				text={ translate( 'You need a valid image in your post to share to Instagram.' ) }
				status="is-info"
				showDismiss={ false }
			>
				<NoticeAction
					href="https://jetpack.com/redirect?source=jetpack-social-media-support-information"
					external
				>
					{ translate( 'Learn more' ) }
				</NoticeAction>
			</Notice>
		);
	}
	return (
		<InstagramPreviews
			caption={ decodeEntities( message || articleTitle ) }
			image={ imageUrl }
			name={ externalName }
			profileImage={ externalProfilePicture }
			media={ media }
		/>
	);
}

export default InstagramSharePreview;
