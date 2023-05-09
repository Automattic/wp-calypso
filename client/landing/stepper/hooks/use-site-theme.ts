import React from 'react';
import wpcom from 'calypso/lib/wp';
import { useSite } from './use-site';

type Theme = {
	id: string;
	name: string;
};

export function useSiteTheme() {
	const ID = useSite()?.ID;
	const [ theme, setTheme ] = React.useState< Theme >();
	React.useEffect( () => {
		if ( ID ) {
			wpcom.req.get( `/sites/${ ID }/themes/mine` ).then( ( theme: Theme ) => {
				setTheme( theme );
			} );
		}
	}, [ ID ] );

	return theme;
}
