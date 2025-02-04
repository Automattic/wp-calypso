import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent } from 'react';
import {
	HorizontalGrid,
	LabelBlock,
	TextInputField,
} from 'calypso/signup/accordion-form/form-components';
import {
	MediaUploadData,
	WordpressMediaUpload,
} from 'calypso/signup/steps/website-content/section-types/components/wordpress-media-upload';
import { useSelector, useDispatch } from 'calypso/state';
import {
	logoUploadCompleted,
	logoUploadFailed,
	logoUploadStarted,
	logoRemoved,
	updateSearchTerms,
} from 'calypso/state/signup/steps/website-content/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { ValidationErrors } from 'calypso/signup/accordion-form/types';

export const SiteInformationContainer = styled.div`
	@media ( min-width: 700px ) {
		min-width: 661px;
	}
`;

export function SiteInformation( {
	sectionID,
	logoUrl,
	searchTerms,
	formErrors,
	onChangeField,
}: {
	sectionID: string;
	logoUrl: string;
	searchTerms?: string;
	formErrors: ValidationErrors;
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

	const onFieldChanged = ( e: ChangeEvent< HTMLInputElement > ) => {
		const {
			target: { value },
		} = e;
		dispatch( updateSearchTerms( value ) );
		onChangeField?.( e );
	};

	return (
		<SiteInformationContainer>
			<LabelBlock>
				{ translate( 'Upload a logo for your website, transparent backgrounds work best.' ) }
			</LabelBlock>
			<HorizontalGrid>
				<WordpressMediaUpload
					media={ { mediaType: 'IMAGE', url: logoUrl } }
					mediaIndex={ 0 }
					site={ site }
					onMediaUploadStart={ () => dispatch( logoUploadStarted() ) }
					onMediaUploadFailed={ () => dispatch( logoUploadFailed() ) }
					onMediaUploadComplete={ onMediaUploadComplete }
					onRemoveImage={ onMediaRemoved }
				/>
			</HorizontalGrid>
			<TextInputField
				name="searchTerms"
				onChange={ onFieldChanged }
				value={ searchTerms || '' }
				error={ formErrors[ 'searchTerms' ] }
				label={ translate( 'Search terms' ) }
				explanation={ translate( 'What phrases would someone search on Google to find you?' ) }
			/>
		</SiteInformationContainer>
	);
}
