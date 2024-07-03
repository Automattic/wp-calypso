import { useCallback, useState } from 'react';
import useSubmitAgencyDetailsMutation from 'calypso/a8c-for-agencies/data/partner-directory/use-submit-agency-details';
import { useAddMedia } from 'calypso/data/media/use-add-media';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { AgencyDetails } from '../../types';

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
	const addMedia = useAddMedia();

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
		if ( formData.logoUrl.startsWith( 'blob:' ) ) {
			setIsUploadingImage( true );
			// This mean we need to upload another image.
			const file = await getImageFile( agencyId ?? 0, formData.logoUrl );

			const media = await addMedia( [ file ], {
				ID: 234537984, // https://a8cforagenciesportfolio.wordpress.com/ is the blog where we will dump profile images so it can be publicly access.
				options: {
					allowed_file_types: [ 'jpg', 'jpeg', 'png' ],
				},
			} );
			setIsUploadingImage( false );

			submit( { ...formData, logoUrl: media.length ? media[ 0 ].URL : null } );
			return;
		}

		submit( formData );
	}, [ addMedia, agencyId, formData, submit ] );

	return {
		onSubmit,
		isSubmitting: isSubmitting || isUploadingImage,
	};
}
