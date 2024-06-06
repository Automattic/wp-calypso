import { useCallback, useState } from 'react';
import {
	DIRECTORY_JETPACK,
	DIRECTORY_PRESSABLE,
	DIRECTORY_WOOCOMMERCE,
	DIRECTORY_WPCOM,
	EXPERTISE_FORM_FIELD_CUSTOMER_FEEDBACK_URL,
	EXPERTISE_FORM_FIELD_DIRECTORIES,
	EXPERTISE_FORM_FIELD_PRODUCTS,
	EXPERTISE_FORM_FIELD_SERVICES,
} from '../../constants';

type Form = {
	[ EXPERTISE_FORM_FIELD_SERVICES ]: string[];
	[ EXPERTISE_FORM_FIELD_PRODUCTS ]: string[];
	[ EXPERTISE_FORM_FIELD_CUSTOMER_FEEDBACK_URL ]: string;
	[ EXPERTISE_FORM_FIELD_DIRECTORIES ]: Record< string, Directory >;
};

type Directory = {
	selected: boolean;
	samples: string[];
};

const DEFAULT_DIRECTORY_STATE: Directory = {
	selected: false,
	samples: [ '', '', '', '', '' ],
};

export default function useExpertiseForm() {
	const [ formData, setFormData ] = useState< Form >( {
		services: [],
		products: [],
		customerFeedbackURL: '',
		directories: {
			[ DIRECTORY_WPCOM ]: { ...DEFAULT_DIRECTORY_STATE },
			[ DIRECTORY_WOOCOMMERCE ]: { ...DEFAULT_DIRECTORY_STATE },
			[ DIRECTORY_JETPACK ]: { ...DEFAULT_DIRECTORY_STATE },
			[ DIRECTORY_PRESSABLE ]: { ...DEFAULT_DIRECTORY_STATE },
		},
	} );

	const getFormValue = useCallback(
		( key: string ) => {
			return formData[ key as keyof Form ];
		},
		[ formData ]
	);

	const setFormValue = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		( key: string, value: any ) => {
			setFormData( {
				...formData,
				[ key as keyof Form ]: value,
			} );
		},
		[ formData ]
	);

	const isDirectorySelected = useCallback(
		( directory: string ) => {
			return !! formData.directories[ directory ]?.selected;
		},
		[ formData ]
	);

	const setDirectorySelected = useCallback(
		( directory: string, selected: boolean ) => {
			setFormValue( EXPERTISE_FORM_FIELD_DIRECTORIES, {
				...formData.directories,
				[ directory ]: {
					...formData.directories[ directory ],
					selected,
				},
			} );
		},
		[ formData.directories, setFormValue ]
	);

	const getDirectories = useCallback( () => {
		return Object.keys( formData.directories );
	}, [ formData.directories ] );

	const getSelectedDirectories = useCallback( () => {
		return Object.keys( formData.directories ).filter( ( directory ) => {
			return formData.directories[ directory ].selected;
		} );
	}, [ formData.directories ] );

	const getDirectoryClientSamples = useCallback(
		( directory: string ) => {
			return formData.directories[ directory ]?.samples;
		},
		[ formData.directories ]
	);

	const setDirectorClientSample = useCallback(
		( directory: string, index: number, value: string ) => {
			setFormValue( EXPERTISE_FORM_FIELD_DIRECTORIES, {
				...formData.directories,
				[ directory ]: {
					...formData.directories[ directory ],
					samples: [
						...formData.directories[ directory ].samples.slice( 0, index ),
						value,
						...formData.directories[ directory ].samples.slice( index + 1 ),
					],
				},
			} );
		},
		[ formData.directories, setFormValue ]
	);

	return {
		formData,
		getFormValue,
		setFormValue,
		isDirectorySelected,
		setDirectorySelected,
		getDirectories,
		getSelectedDirectories,
		getDirectoryClientSamples,
		setDirectorClientSample,
	};
}
