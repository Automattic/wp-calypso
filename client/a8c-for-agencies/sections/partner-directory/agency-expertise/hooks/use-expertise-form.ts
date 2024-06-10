import { useCallback, useState } from 'react';
import { AgencyDirectoryApplication, DirectoryApplicationType } from '../../types';

type Props = {
	initialData?: AgencyDirectoryApplication;
};

function validateURL( url: string ) {
	return /^(https?:\/\/)?([a-z0-9-]+\.)*[a-z0-9-]+\.[a-z]+(:[0-9]+)?(\/[a-z0-9-]*)*$/.test( url );
}

export default function useExpertiseForm( { initialData }: Props ) {
	const [ formData, setFormData ] = useState< AgencyDirectoryApplication >(
		initialData ?? {
			status: 'pending',
			services: [],
			products: [],
			feedbackUrl: '',
			directories: [],
		}
	);

	const isDirectorySelected = useCallback(
		( name: string ) => {
			return !! formData.directories.some( ( { directory } ) => directory === name );
		},
		[ formData ]
	);

	const isDirectoryApproved = useCallback(
		( name: string ) => {
			return formData.directories.some(
				( { directory, status } ) => directory === name && status === 'approved'
			);
		},
		[ formData ]
	);

	const setDirectorySelected = useCallback(
		( name: DirectoryApplicationType, selected: boolean ) => {
			setFormData( ( state ) => {
				const directories = state.directories;

				if ( selected ) {
					return {
						...state,
						directories: [
							...directories,
							{
								status: 'pending',
								directory: name,
								published: false,
								urls: [ '', '', '', '', '' ],
								note: '',
							},
						],
					};
				}

				return {
					...state,
					directories: directories.filter( ( { directory } ) => directory !== name ),
				};
			} );
		},
		[]
	);

	const getDirectoryClientSamples = useCallback(
		( name: string ) => {
			return formData.directories.find( ( { directory } ) => directory === name )?.urls || [];
		},
		[ formData.directories ]
	);

	const setDirectorClientSample = useCallback( ( directory: string, urls: string[] ) => {
		setFormData( ( state ) => ( {
			...state,
			directories: state.directories.map( ( dir ) => {
				if ( dir.directory === directory ) {
					return {
						...dir,
						urls,
					};
				}
				return dir;
			} ),
		} ) );
	}, [] );

	const isValidFormData = useCallback( (): boolean => {
		let isValid =
			formData.services.length > 0 &&
			formData.products.length > 0 &&
			formData.directories.length > 0;

		if ( isValid ) {
			// Ensure that each directory request has 5 non-empty and valid URLs
			isValid = formData.directories.every( ( { urls } ) => {
				return urls.every( ( url ) => url && validateURL( url ) );
			} );
		}

		return isValid;
	}, [ formData ] );

	return {
		formData,
		setFormData,
		isValidFormData,
		isDirectorySelected,
		isDirectoryApproved,
		setDirectorySelected,
		getDirectoryClientSamples,
		setDirectorClientSample,
	};
}
