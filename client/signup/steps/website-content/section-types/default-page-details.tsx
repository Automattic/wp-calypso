import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import {
	TextAreaField,
	HorizontalGrid,
	LabelBlock,
	CheckboxField,
} from 'calypso/signup/accordion-form/form-components';
import { useTranslatedPageDescriptions } from 'calypso/signup/difm/translation-hooks';
import { useSelector, useDispatch } from 'calypso/state';
import {
	mediaRemoved,
	mediaUploaded,
	mediaUploadFailed,
	mediaUploadInitiated,
	websiteContentFieldChanged,
} from 'calypso/state/signup/steps/website-content/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { MediaUploadData, WordpressMediaUpload } from '../wordpress-media-upload';
import type { ValidationErrors } from 'calypso/signup/accordion-form/types';
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
	const isEnglishLocale = useIsEnglishLocale();

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
		onChangeField?.( e );
	};

	const onCheckboxChanged = ( e: ChangeEvent< HTMLInputElement > ) => {
		const {
			target: { name, checked },
		} = e;
		dispatch(
			websiteContentFieldChanged( {
				pageId: page.id,
				fieldName: name,
				fieldValue: !! checked,
			} )
		);
		onChangeField && onChangeField( e );
	};

	const imageCaption = translate(
		'Upload up to %(noOfImages)d images. You can find stock images {{a}}here{{/a}}, or we’ll select some during the build.',
		{
			args: { noOfImages: page.media.length },
			components: {
				a: <a href="https://www.pexels.com/" target="_blank" rel="noreferrer" />,
			},
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
				disabled={ !! page.useFillerContent }
				hasFillerContentCheckbox={ isEnglishLocale }
			/>
			{ isEnglishLocale && (
				<CheckboxField
					name="useFillerContent"
					checked={ page.useFillerContent || false }
					value="true"
					onChange={ onCheckboxChanged }
					label={ translate( 'Build this page with AI-generated text.' ) }
					helpText={ translate(
						'When building your site, we will use AI to generate copy based on the search phrases you have provided. The copy can be edited later with the WordPress editor.'
					) }
				/>
			) }
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
