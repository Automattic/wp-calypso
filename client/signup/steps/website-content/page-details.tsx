import { useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	Label,
	TextAreaField,
	HorizontalGrid,
} from 'calypso/signup/accordion-form/form-components';
import { ValidationErrors } from 'calypso/signup/accordion-form/types';
import {
	imageRemoved,
	imageUploaded,
	imageUploadFailed,
	imageUploadInitiated,
	textChanged,
} from 'calypso/state/signup/steps/website-content/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { MediaUploadData, WordpressMediaUpload } from './wordpress-media-upload';
import type { PageData } from 'calypso/state/signup/steps/website-content/schema';
import type { SiteData } from 'calypso/state/ui/selectors/get-selected-site';
import type { TranslateResult } from 'i18n-calypso';

export const CONTENT_SUFFIX = 'Content';
export const IMAGE_PREFIX = 'Image';

export function PageDetails( {
	page,
	formErrors,
	label,
	onChangeField,
}: {
	page: PageData;
	formErrors: ValidationErrors;
	label: TranslateResult | undefined;
	onChangeField?: ( { target: { name, value } }: ChangeEvent< HTMLInputElement > ) => void;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const site = useSelector( getSelectedSite );
	const pageTitle = page.title;
	const pageID = page.id;

	const onMediaUploadFailed = ( { mediaIndex }: MediaUploadData ) => {
		dispatch(
			imageUploadFailed( {
				pageId: page.id,
				mediaIndex,
			} )
		);
	};

	const onMediaUploadStart = ( { mediaIndex }: MediaUploadData ) => {
		dispatch(
			imageUploadInitiated( {
				pageId: page.id,
				mediaIndex,
			} )
		);
	};

	const onMediaUploadComplete = ( { title, URL, uploadID, mediaIndex }: MediaUploadData ) => {
		dispatch(
			imageUploaded( {
				pageId: page.id,
				image: { url: URL as string, caption: title as string, uploadID },
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
			imageRemoved( {
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
			textChanged( {
				pageId: page.id,
				content: value,
			} )
		);
		onChangeField && onChangeField( e );
	};
	const fieldName = page.id + CONTENT_SUFFIX;
	return (
		<>
			<TextAreaField
				name={ fieldName }
				onChange={ onContentChange }
				value={ page.content }
				error={ formErrors[ fieldName ] }
				label={
					label ||
					translate( 'Please provide the text you want to appear on your %(pageTitle)s page.', {
						args: { pageTitle },
					} )
				}
			/>
			<Label>
				{ translate( 'Upload up to 3 images to be used on your %(pageTitle)s page.', {
					args: { pageTitle },
				} ) }
			</Label>
			<HorizontalGrid>
				{ page.images.map( ( image, i ) => (
					<WordpressMediaUpload
						key={ image.uploadID ?? i }
						mediaIndex={ i }
						site={ site as SiteData }
						onMediaUploadStart={ onMediaUploadStart }
						onMediaUploadFailed={ onMediaUploadFailed }
						onMediaUploadComplete={ onMediaUploadComplete }
						initialCaption={ image.caption }
						initialUrl={ image.url }
						onRemoveImage={ onMediaRemoved }
					/>
				) ) }
			</HorizontalGrid>
		</>
	);
}
