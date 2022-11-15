import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Label, HorizontalGrid } from 'calypso/signup/accordion-form/form-components';
import {
	MediaUploadData,
	WordpressMediaUpload,
} from 'calypso/signup/steps/website-content/wordpress-media-upload';
import {
	logoUploadCompleted,
	logoUploadFailed,
	logoUploadStarted,
	logoRemoved,
} from 'calypso/state/signup/steps/website-content/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';

export const LogoUploadSectionContainer = styled.div`
	@media ( min-width: 700px ) {
		min-width: 661px;
	}
`;

export function LogoUploadSection( {
	sectionID,
	logoUrl,
	onChangeField,
}: {
	sectionID: string;
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
				target: { name: sectionID, value: URL },
			} as ChangeEvent< HTMLInputElement > );
	};

	const onMediaRemoved = () => {
		dispatch( logoRemoved() );
	};

	return (
		<LogoUploadSectionContainer>
			<Label>
				{ translate( 'Upload a logo for your website, transparent backgrounds work best.' ) }
			</Label>
			<HorizontalGrid>
				<WordpressMediaUpload
					mediaType="IMAGE"
					mediaIndex={ 0 }
					site={ site }
					onMediaUploadStart={ () => dispatch( logoUploadStarted() ) }
					onMediaUploadFailed={ () => dispatch( logoUploadFailed() ) }
					onMediaUploadComplete={ onMediaUploadComplete }
					initialUrl={ logoUrl }
					onRemoveImage={ onMediaRemoved }
				/>
			</HorizontalGrid>
		</LogoUploadSectionContainer>
	);
}
