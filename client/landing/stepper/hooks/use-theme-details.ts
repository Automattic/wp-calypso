import React from 'react';
import wpcom from 'calypso/lib/wp';

type Theme = {
	id: string;
	name: string;
	author: string;
	author_uri: string;
	description: string;
	date_updated: string;
	taxonomies: Record< string, [] >;
};

export function useThemeDetails( slug: string ) {
	const [ theme, setTheme ] = React.useState< Theme >();
	React.useEffect( () => {
		if ( slug ) {
			wpcom.req.get( `/themes/${ slug }`, { apiVersion: '1.1' } ).then( ( theme: Theme ) => {
				setTheme( theme );
			} );
		}
	}, [ slug ] );

	return theme;
}
