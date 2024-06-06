import { useCallback, useState } from 'react';
import { AgencyDirectoryApplication, DirectoryApplicationType } from '../../types';

export default function useExpertiseForm() {
	const [ formData, setFormData ] = useState< AgencyDirectoryApplication >( {
		status: 'pending',
		services: [],
		products: [],
		feedbackUrl: '',
		directories: [],
	} );

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

	return {
		formData,
		setFormData,
		isDirectorySelected,
		isDirectoryApproved,
		setDirectorySelected,
		getDirectoryClientSamples,
		setDirectorClientSample,
	};
}
