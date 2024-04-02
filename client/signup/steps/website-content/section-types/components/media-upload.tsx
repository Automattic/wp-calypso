import { useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { HorizontalGrid, LabelBlock } from 'calypso/signup/accordion-form/form-components';
import {
	mediaUploadFailed,
	mediaUploadInitiated,
	mediaUploaded,
	mediaRemoved,
} from 'calypso/state/signup/steps/website-content/actions';
import { type MediaUploadData, WordpressMediaUpload } from './wordpress-media-upload';
import type { SiteDetails } from '@automattic/data-stores';
import type { PageData } from 'calypso/state/signup/steps/website-content/types';

interface Props {
	page: PageData;
	site: SiteDetails;
	onChangeField?: ( e: ChangeEvent< HTMLInputElement > ) => void;
}

const IMAGE_PREFIX = 'Image';

export const MediaUpload = ( { site, page, onChangeField }: Props ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const { id: pageId, title: pageTitle } = page;

	const onMediaUploadFailed = ( { mediaIndex }: MediaUploadData ) => {
		dispatch(
			mediaUploadFailed( {
				pageId,
				mediaIndex,
			} )
		);
	};

	const onMediaUploadStart = ( { mediaIndex }: MediaUploadData ) => {
		dispatch(
			mediaUploadInitiated( {
				pageId,
				mediaIndex,
			} )
		);
	};

	const onMediaUploadComplete = ( {
		title,
		URL,
		uploadID,
		mediaIndex,
		thumbnailUrl,
	}: MediaUploadData ) => {
		dispatch(
			mediaUploaded( {
				pageId,
				media: { url: URL as string, caption: title as string, uploadID, thumbnailUrl },
				mediaIndex,
			} )
		);

		onChangeField?.( {
			target: { name: pageId + IMAGE_PREFIX + mediaIndex, value: URL },
		} as ChangeEvent< HTMLInputElement > );
	};

	const onMediaRemoved = ( { mediaIndex }: MediaUploadData ) => {
		dispatch(
			mediaRemoved( {
				pageId,
				mediaIndex,
			} )
		);
	};

	const getMediaCaption = () => {
		const [ firstMedia ] = page.media;
		switch ( firstMedia.mediaType ) {
			case 'VIDEO':
				return translate(
					'Upload up to %(noOfVideos)d videos to be used on your %(pageTitle)s page.',
					{
						args: { pageTitle, noOfVideos: page.media.length },
					}
				);
			case 'IMAGE':
				return translate(
					'Upload up to %(noOfImages)d images. You can find stock images {{a}}here{{/a}}, or we’ll select some during the build.',
					{
						args: { noOfImages: page.media.length },
						components: {
							a: <a href="https://www.pexels.com/" target="_blank" rel="noreferrer" />,
						},
					}
				);
			case 'IMAGE-AND-VIDEO':
				return translate(
					'Upload up to %(noOfImages)d images or videos. You can find stock images {{a}}here{{/a}}, or we’ll select some during the build.',
					{
						args: { noOfImages: page.media.length },
						components: {
							a: <a href="https://www.pexels.com/" target="_blank" rel="noreferrer" />,
						},
					}
				);
			default:
				return '';
		}
	};

	return (
		<>
			<LabelBlock>{ getMediaCaption() }</LabelBlock>
			<HorizontalGrid>
				{ page.media.map( ( media, i ) => (
					<WordpressMediaUpload
						media={ media }
						key={ `${ i }` }
						mediaIndex={ i }
						site={ site }
						onMediaUploadStart={ onMediaUploadStart }
						onMediaUploadFailed={ onMediaUploadFailed }
						onMediaUploadComplete={ onMediaUploadComplete }
						onRemoveImage={ onMediaRemoved }
					/>
				) ) }
			</HorizontalGrid>
		</>
	);
};
