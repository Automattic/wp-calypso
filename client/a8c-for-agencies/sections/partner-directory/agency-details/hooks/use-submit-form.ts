import { useCallback, useState } from 'react';
import useSubmitAgencyDetailsMutation from 'calypso/a8c-for-agencies/data/partner-directory/use-submit-agency-details';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { AgencyDetails } from '../../types';
import { useUploadLogo } from './use-upload-logo';

type Props = {
	formData: AgencyDetails;
	onSubmitSuccess?: ( data: Agency ) => void;
	onSubmitError?: () => void;
};

const getImageFile = async ( agencyId: number, blobURL: string ) => {
	const blob = await fetch( blobURL ).then( ( response ) => response.blob() );
	return new File( [ blob ], `logo-image-${ agencyId }.png`, { type: blob.type } );
};

export default function useSubmitForm( { formData, onSubmitSuccess, onSubmitError }: Props ) {
	const agencyId = useSelector( getActiveAgencyId );

	const uploadLogo = useUploadLogo();

	const [ isUploadingImage, setIsUploadingImage ] = useState( false );

	const { mutate: submit, isPending: isSubmitting } = useSubmitAgencyDetailsMutation( {
		onSuccess: ( data ) => {
			if ( onSubmitSuccess && data?.profile ) {
				onSubmitSuccess( data );
			} else {
				onSubmitError?.();
			}
		},
		onError: () => {
			onSubmitError?.();
		},
	} );

	const onSubmit = useCallback( async () => {
		let newLogo = null;

		if ( formData.logoUrl.startsWith( 'blob:' ) ) {
			setIsUploadingImage( true );

			const file = await getImageFile( agencyId ?? 0, formData.logoUrl );
			const upload = await uploadLogo( agencyId, file );
			newLogo = upload?.logo_url;

			setIsUploadingImage( false );
		}

		submit( {
			...formData,
			...( newLogo ? { logoUrl: newLogo } : {} ),
		} );
	}, [ agencyId, formData, submit, uploadLogo ] );

	return {
		onSubmit,
		isSubmitting: isSubmitting || isUploadingImage,
	};
}
