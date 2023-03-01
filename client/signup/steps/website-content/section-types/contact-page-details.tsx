import { useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	TextAreaField,
	HorizontalGrid,
	ContactInformation,
	LabelBlock,
} from 'calypso/signup/accordion-form/form-components';
import { useTranslatedPageDescriptions } from 'calypso/signup/difm/translation-hooks';
import {
	MediaUploadData,
	WordpressMediaUpload,
} from 'calypso/signup/steps/website-content/wordpress-media-upload';
import {
	websiteContentFieldChanged,
	mediaUploaded,
	mediaRemoved,
	mediaUploadFailed,
	mediaUploadInitiated,
} from 'calypso/state/signup/steps/website-content/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { PageDetailsParams } from './default-page-details';
import type { ContactPageData } from 'calypso/state/signup/steps/website-content/types';

export const CONTENT_SUFFIX = 'Content';
export const IMAGE_PREFIX = 'Image';

export function ContactPageDetails( {
	page,
	formErrors,
	context,
	onChangeField,
}: PageDetailsParams< ContactPageData > ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const site = useSelector( getSelectedSite );
	const pageTitle = page.title;
	const pageID = page.id;
	const description = useTranslatedPageDescriptions( pageID, context );

	const onMediaUploadFailed = ( { mediaIndex }: MediaUploadData ) => {
		dispatch(
			mediaUploadFailed( {
				pageId: page.id,
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

			<LabelBlock>
				{ translate( 'Upload up to %(noOfImages)d images to be used on your %(pageTitle)s page.', {
					args: { pageTitle, noOfImages: page.media.length },
				} ) }
			</LabelBlock>
			<HorizontalGrid>
				{ page.media.map( ( media, i ) => (
					<WordpressMediaUpload
						media={ media }
						key={ media.uploadID ?? i }
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
