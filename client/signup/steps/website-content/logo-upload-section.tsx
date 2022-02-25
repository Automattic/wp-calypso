import { useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Label, HorizontalGrid } from 'calypso/signup/accordion-form/form-components';
import {
	logoUploadCompleted,
	logoUploadFailed,
	logoUploadStarted,
} from 'calypso/state/signup/steps/website-content/actions';
import { LOGO_SECTION_ID } from 'calypso/state/signup/steps/website-content/reducer';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { SiteData } from 'calypso/state/ui/selectors/get-selected-site';
import { MediaUploadData, WordpressMediaUpload } from './wordpress-media-upload';

export function LogoUploadSection( {
	logoUrl,
	onChangeField,
}: {
	logoUrl: string;
	onChangeField?: ( { target: { name, value } }: ChangeEvent< HTMLInputElement > ) => void;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const site = useSelector( getSelectedSite );

	const onMediaUploadComplete = ( { URL }: MediaUploadData ) => {
		dispatch( logoUploadCompleted( URL as string ) );
		onChangeField &&
			onChangeField( {
				target: { name: LOGO_SECTION_ID, value: URL },
			} as ChangeEvent< HTMLInputElement > );
	};

	return (
		<>
			<Label>{ translate( 'Upload your business logo.' ) }</Label>
			<HorizontalGrid>
				<WordpressMediaUpload
					mediaIndex={ 1 }
					site={ site as SiteData }
					onMediaUploadStart={ () => dispatch( logoUploadStarted() ) }
					onMediaUploadFailed={ () => dispatch( logoUploadFailed() ) }
					onMediaUploadComplete={ onMediaUploadComplete }
					initialUrl={ logoUrl }
				/>
			</HorizontalGrid>
		</>
	);
}
