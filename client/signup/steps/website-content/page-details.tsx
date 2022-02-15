import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, ReactChild } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
	SubLabel,
	Label,
	TextAreaField,
	HorizontalGrid,
} from 'calypso/signup/accordion-form/form-components';
import { imageUploaded, textChanged } from 'calypso/state/signup/steps/website-content/actions';
import { PageData } from 'calypso/state/signup/steps/website-content/schema';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { SiteData } from 'calypso/state/ui/selectors/get-selected-site';
import { MediaUploadData, WordpressMediaUpload } from './wordpress-media-upload';

export const CONTENT_SUFFIX = 'Content';
export const IMAGE_PREFIX = 'Image';

export function PageDetails( {
	page,
	formErrors,
	onChangeField,
}: {
	page: PageData;
	formErrors: Record< string, ReactChild >;
	onChangeField?: ( { target: { name, value } }: ChangeEvent< HTMLInputElement > ) => void;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const site = useSelector( getSelectedSite );
	const pageTitle = page.title;
	const pageID = page.id;

	const onMediaUploaded = ( { title, URL, uploadID, mediaIndex }: MediaUploadData ) => {
		dispatch(
			imageUploaded( {
				id: page.id,
				image: { url: URL, caption: title, uploadID },
				mediaIndex,
			} )
		);
		onChangeField &&
			onChangeField( {
				target: { name: pageID + IMAGE_PREFIX + mediaIndex, value: URL },
			} as ChangeEvent< HTMLInputElement > );
	};

	const onContentChange = ( e: ChangeEvent< HTMLInputElement > ) => {
		const {
			target: { value },
		} = e;
		dispatch(
			textChanged( {
				id: page.id,
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
				label={ translate( 'Content' ) }
				onChange={ onContentChange }
				value={ page.content }
				error={ formErrors[ fieldName ] }
				sublabel={ translate(
					'Please provide the text you want to appear on your %(pageTitle)s page.',
					{
						args: { pageTitle },
					}
				) }
			/>
			<Label>{ translate( 'Media' ) }</Label>
			<SubLabel>
				{ translate( 'Upload up to 3 images to be used on your %(pageTitle)s page', {
					args: { pageTitle },
				} ) }
			</SubLabel>
			<HorizontalGrid>
				{ page.images.map( ( image, i ) => (
					<WordpressMediaUpload
						key={ image.uploadID ?? i }
						mediaIndex={ i }
						site={ site as SiteData }
						onMediaUploaded={ onMediaUploaded }
						initialCaption={ image.caption }
						initialUrl={ image.url }
					/>
				) ) }
			</HorizontalGrid>
		</>
	);
}
