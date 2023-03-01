import { useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	TextAreaField,
	HorizontalGrid,
	LabelBlock,
} from 'calypso/signup/accordion-form/form-components';
import { ValidationErrors } from 'calypso/signup/accordion-form/types';
import { useTranslatedPageDescriptions } from 'calypso/signup/difm/translation-hooks';
import {
	mediaRemoved,
	mediaUploaded,
	mediaUploadFailed,
	mediaUploadInitiated,
	websiteContentFieldChanged,
} from 'calypso/state/signup/steps/website-content/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { MediaUploadData, WordpressMediaUpload } from '../wordpress-media-upload';
import type { BBETranslationContext } from 'calypso/signup/difm/translation-hooks';
import type { PageData } from 'calypso/state/signup/steps/website-content/types';

export const CONTENT_SUFFIX = 'Content';
export const IMAGE_PREFIX = 'Image';
export interface PageDetailsParams< T > {
	page: T;
	formErrors: ValidationErrors;
	context: BBETranslationContext;
	onChangeField?: ( { target: { name, value } }: ChangeEvent< HTMLInputElement > ) => void;
}
export function DefaultPageDetails( {
	page,
	formErrors,
	context,
	onChangeField,
}: PageDetailsParams< PageData > ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const site = useSelector( getSelectedSite );
	const pageTitle = page.title;
	const pageID = page.id;
	const description = useTranslatedPageDescriptions( pageID, context );

	const onMediaUploadFailed = ( { mediaIndex }: MediaUploadData ) => {
		dispatch(
			mediaUploadFailed( {
				pageId: pageID,
				mediaIndex,
			} )
		);
	};

	const onMediaUploadStart = ( { mediaIndex }: MediaUploadData ) => {
		dispatch(
			mediaUploadInitiated( {
				pageId: page.id,
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
				pageId: page.id,
				media: { url: URL as string, caption: title as string, uploadID, thumbnailUrl },
				mediaIndex,
			} )
		);
		onChangeField &&
			onChangeField( {
				target: { name: pageID + IMAGE_PREFIX + mediaIndex, value: URL },
			} as ChangeEvent< HTMLInputElement > );
	};

	const onMediaRemoved = ( { mediaIndex }: MediaUploadData ) => {
		dispatch(
			mediaRemoved( {
				pageId: page.id,
				mediaIndex,
			} )
		);
	};

	const onContentChange = ( e: ChangeEvent< HTMLInputElement > ) => {
		const {
			target: { value },
		} = e;
		dispatch(
			websiteContentFieldChanged( {
				pageId: page.id,
				fieldName: 'content',
				fieldValue: value,
			} )
		);
		onChangeField && onChangeField( e );
	};

	const imageCaption = translate(
		'Upload up to %(noOfImages)d images to be used on your %(pageTitle)s page.',
		{
			args: { pageTitle, noOfImages: page.media.length },
		}
	);
	const videoCaption = translate(
		'Upload up to %(noOfVideos)d videos to be used on your %(pageTitle)s page.',
		{
			args: { pageTitle, noOfVideos: page.media.length },
		}
	);
	const getMediaCaption = () => {
		const [ firstMedia ] = page.media;
		switch ( firstMedia.mediaType ) {
			case 'VIDEO':
				return videoCaption;
			case 'IMAGE':
			default:
				return imageCaption;
				break;
		}
	};
	const fieldName = page.id + CONTENT_SUFFIX;
	return (
		<>
			<TextAreaField
				name={ fieldName }
				onChange={ onContentChange }
				value={ page.content }
				error={ formErrors[ fieldName ] }
				label={ description }
			/>
			<LabelBlock>{ getMediaCaption() }</LabelBlock>
			<HorizontalGrid>
				{ page.media.map( ( media, i ) => (
					<WordpressMediaUpload
						key={ media.uploadID ?? i }
						media={ media }
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
}
