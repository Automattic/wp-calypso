import { useQuery } from '@tanstack/react-query';
import { getExtensionDescription } from './get-extension-description';
const BASE_CRM_APP_URL =
	process.env.NODE_ENV === 'development'
		? 'https://devapp.jetpackcrm.com'
		: 'https://app.jetpackcrm.com';

export interface Extension {
	name: string;
	description: string;
	slug: string;
	version: string;
	kbUrl?: string;
}

const fetchExtensions = async (): Promise< Extension[] > => {
	const response = await fetch( `${ BASE_CRM_APP_URL }/api/extensions`, {
		method: 'GET',
		credentials: 'omit',
		headers: {
			'Content-Type': 'application/json',
		},
	} );

	if ( ! response.ok ) {
		switch ( response.status ) {
			case 404:
				throw new Error( 'Extensions not found' );
			default:
				throw new Error(
					'Could not connect to download server. Please check your connection and try again.'
				);
		}
	}

	const data = await response.json();
	if ( ! data.success || ! Array.isArray( data.extensions ) ) {
		throw new Error(
			data.message ||
				'Could not connect to download server. Please check your connection and try again.'
		);
	}

	// Apply translatable descriptions to the extensions
	const extensionsWithTranslatedDescriptions = data.extensions.map( ( extension: Extension ) => ( {
		...extension,
		// Use the translatable description if available, otherwise use the original
		description: getExtensionDescription( extension.slug ) || extension.description,
	} ) );

	// Sort extensions alphabetically
	return extensionsWithTranslatedDescriptions.sort( ( a: Extension, b: Extension ) =>
		a.name.localeCompare( b.name )
	);
};

export default function useFetchJetpackCRMExtensionsQuery( enabled = true ) {
	return useQuery( {
		queryKey: [ 'jetpack-crm-extensions' ],
		queryFn: () => fetchExtensions(),
		enabled,
	} );
}
