import { useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { useSite } from './use-site';

const useAccentColor = () => {
	const ID = useSite()?.ID;
	const [ color, setColor ] = useState( '' );

	if ( ID ) {
		wpcom.req
			.get( {
				path: `/sites/${ ID }/global-styles-variation/site-accent-color?preview-global-styles=true`,
				apiNamespace: 'wpcom/v2',
			} )
			.then( ( color: string ) => {
				setColor( color );
			} );
	}

	return color;
};

export default useAccentColor;
