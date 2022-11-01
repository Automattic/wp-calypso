import { useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	Label,
	TextAreaField,
	HorizontalGrid,
	ContactInformation,
} from 'calypso/signup/accordion-form/form-components';
import {
	BBE_WEBSITE_CONTENT_FILLING_STEP,
	useTranslatedPageDescriptions,
} from 'calypso/signup/difm/translation-hooks';
import {
	MediaUploadData,
	WordpressMediaUpload,
} from 'calypso/signup/steps/website-content/wordpress-media-upload';
import {
	websiteContentFieldChanged,
	imageUploaded,
	imageRemoved,
	imageUploadFailed,
	imageUploadInitiated,
} from 'calypso/state/signup/steps/website-content/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { PageDetailsParams } from './default-page-details';
import type { ContactPageData } from 'calypso/state/signup/steps/website-content/schema';

export const CONTENT_SUFFIX = 'Content';
export const IMAGE_PREFIX = 'Image';

export function ContactPageDetails( {
	page,
	formErrors,
	onChangeField,
}: PageDetailsParams< ContactPageData > ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const site = useSelector( getSelectedSite );
	const pageTitle = page.title;
	const pageID = page.id;
	const description = useTranslatedPageDescriptions( pageID, BBE_WEBSITE_CONTENT_FILLING_STEP );

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

	const onFieldChanged = ( e: ChangeEvent< HTMLInputElement > ) => {
		const {
			target: { name, value },
		} = e;
		dispatch(
			websiteContentFieldChanged( {
				pageId: page.id,
				fieldName: name,
				fieldValue: value,
			} )
		);
		onChangeField && onChangeField( e );
	};
	const fieldName = page.id + CONTENT_SUFFIX;
	return (
		<>
			<TextAreaField
				name="content"
				onChange={ onFieldChanged }
				value={ page.content }
				error={ formErrors[ fieldName ] }
				label={ description }
			/>
			<ContactInformation
				displayEmailProps={ {
					value: page.displayEmail || '',
					name: 'displayEmail',
				} }
				displayPhoneProps={ {
					value: page.displayPhone || '',
					name: 'displayPhone',
				} }
				displayAddressProps={ {
					value: page.displayAddress || '',
					name: 'displayAddress',
				} }
				onChange={ onFieldChanged }
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
						site={ site }
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
